#!/usr/bin/env python3
"""Read-only Funnel checks. Never changes routing, services or TLS verification."""
import json
import socket
import subprocess
from urllib.parse import urlsplit

HOST = 'server-klaro.tail6c534c.ts.net'


def legacy_routes(config):
    if not isinstance(config, dict):
        raise ValueError('Configurazione Funnel non valida')
    found = []
    web = config.get('Web', {})
    if not isinstance(web, dict):
        raise ValueError('Sezione Web Funnel non valida')
    for host, server in web.items():
        for path, handler in server.get('Handlers', {}).items():
            proxy = handler.get('Proxy', '')
            target = urlsplit(proxy)
            if target.hostname in ('127.0.0.1', 'localhost', '::1') and target.port in (5173, 3001):
                found.append({'route': host + path, 'target': proxy})
    for foreground in config.get('Foreground', {}).values():
        found.extend(legacy_routes(foreground))
    return found


def command(args):
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=12)
        return {'code': result.returncode, 'stdout': result.stdout.strip(), 'stderr': result.stderr.strip()[:500]}
    except (OSError, subprocess.TimeoutExpired) as error:
        return {'code': -1, 'stdout': '', 'stderr': str(error)}


def probe(url, tls12=False):
    # -q is first: ignore ~/.curlrc, including any insecure or redirect defaults.
    args = ['curl', '-q', '--silent', '--show-error', '--noproxy', '*', '--connect-timeout', '4',
            '--max-time', '8', '--proto', '=http,https', '--output', '/dev/null', '--write-out', '%{http_code}']
    if tls12:
        args += ['--tlsv1.2', '--tls-max', '1.2']
    result = command(args + ['--url', url])
    return {'url': url, 'tls': '1.2' if tls12 else 'default', 'httpStatus': result['stdout'],
            'exitCode': result['code'], 'error': result['stderr']}


def main():
    report = {'readOnly': True, 'credentialsSent': False, 'tlsVerification': True}
    report['tailscaleVersion'] = command(['tailscale', 'version'])['stdout'].splitlines()[:1]
    state = command(['tailscale', 'status', '--json'])
    try:
        data = json.loads(state['stdout'])
        report['tailscale'] = {'BackendState': data.get('BackendState'), 'Online': data.get('Self', {}).get('Online'), 'Health': data.get('Health')}
    except (ValueError, AttributeError):
        report['tailscale'] = {'error': state['stderr'] or 'Stato non disponibile'}
    config = command(['tailscale', 'funnel', 'status', '--json'])
    try:
        data = json.loads(config['stdout'])
        report['legacyDependencies'] = legacy_routes(data)
        report['funnel'] = {'TCP': data.get('TCP'), 'Web': data.get('Web'), 'AllowFunnel': data.get('AllowFunnel')}
    except (ValueError, AttributeError):
        report['funnel'] = {'error': config['stderr'] or 'Configurazione non disponibile'}
    try:
        report['resolvedAddresses'] = sorted({item[4][0] for item in socket.getaddrinfo(HOST, 8443, type=socket.SOCK_STREAM)})
    except OSError as error:
        report['resolvedAddresses'] = {'error': str(error)}
    report['probes'] = []
    for url, tls12 in [('http://127.0.0.1:5174/api/health', False), ('http://127.0.0.1:5184/', False),
                       (f'https://{HOST}:8443/', False), (f'https://{HOST}:8443/', True), (f'https://{HOST}/', False)]:
        print(f'Controllo {url}' + (' (TLS 1.2)' if tls12 else ''), flush=True)
        report['probes'].append(probe(url, tls12))
    print(json.dumps(report, ensure_ascii=False, indent=2), flush=True)
    print('Attesi: 200 sulla salute 5174, 401 sul gateway 5184 e sul playtest 8443. '
          'Le richieste partono dal server: non provano l\'accesso da una rete esterna.', flush=True)


if __name__ == '__main__':
    main()
