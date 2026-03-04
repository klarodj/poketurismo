<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
<script>
    // gestione dello switch dei tab
    window.addEventListener('DOMContentLoaded', () => {
        const tabs = document.querySelectorAll('[role="tab"]');
        const tabList = document.querySelector('[role="tablist"]');

        // Add a click event handler to each tab
        tabs.forEach(tab => {
            tab.addEventListener('click', changeTabs);
        });

        // Enable arrow navigation between tabs in the tab list
        let tabFocus = 0;

        tabList.addEventListener('keydown', e => {
            // Move right
            if (e.keyCode === 39 || e.keyCode === 37) {
            tabs[tabFocus].setAttribute('tabindex', -1);
            if (e.keyCode === 39) {
                tabFocus++;
                // If we're at the end, go to the start
                if (tabFocus >= tabs.length) {
                tabFocus = 0;
                }
                // Move left
            } else if (e.keyCode === 37) {
                tabFocus--;
                // If we're at the start, move to the end
                if (tabFocus < 0) {
                tabFocus = tabs.length - 1;
                }
            }

            tabs[tabFocus].setAttribute('tabindex', 0);
            tabs[tabFocus].focus();
            }
        });
        });

        function changeTabs(e) {
        const target = e.target;
        const parent = target.parentNode;
        const grandparent = parent.parentNode;

        // Remove all current selected tabs
        parent
            .querySelectorAll('[aria-selected="true"]')
            .forEach(t => t.setAttribute('aria-selected', false));

        // Set this tab as selected
        target.setAttribute('aria-selected', true);

        // Hide all tab panels
        grandparent
            .querySelectorAll('[role="tabpanel"]')
            .forEach(p => p.setAttribute('hidden', true));

        // Show the selected panel
        grandparent.parentNode
            .querySelector(`#${target.getAttribute('aria-controls')}`)
            .removeAttribute('hidden');

    }

    // gestione telefono 3310 per notifiche
    function showHidePhone() {
        var phone = document.getElementById("divPhone");
        if (phone.classList.contains('d-none')){
            phone.classList.remove('d-none');
            phone.classList.add('d-block');
        }else{
            phone.classList.remove('d-block');
            phone.classList.add('d-none');
        }
    }
    const mph = document.getElementById("menuPhone");
    const ph = document.getElementById("divPhone");
    mph.addEventListener("click", showHidePhone);
    ph.addEventListener("click", showHidePhone);

    // lancia la selezione dell'auto attuale
    function selectCar(cid, uid) {
        // valori di input
        var val = {carId: cid, userId: uid};
        // php da eseguire
        fetch('inc/change_garage.php', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            // passo i valori di input
            body: JSON.stringify(val)
        }).then(response => response.json())
        .then(data => {
            // prelevo i valori di output come oggetto
            console.log(data.result);
            location.reload();
        })
        .catch((error) => console.log(error));
    }

    // lancia l'acquisto dell'auto
    function buyCar(t, cid, uid){
        // valori di input
        var val = {type: t, carId: cid, userId: uid};
        // php da eseguire
        fetch('inc/buy_car.php', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            // passo i valori di input
            body: JSON.stringify(val)
        }).then(response => response.json())
        .then(data => {
            // prelevo i valori di output come oggetto
            alert(data.result);
            window.location.assign('main.php');
        })
        .catch((error) => console.log(error));
    }

    // lancia la vendita dell'auto
    function sellCar(gid, uid){
        if (confirm('Are you sure?')){
            console.log('faccio');
            // valori di input
            var val = {garageId: gid, userId: uid};
            // php da eseguire
            fetch('inc/sell_car.php', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                // passo i valori di input
                body: JSON.stringify(val)
            }).then(response => response.json())
            .then(data => {
                // prelevo i valori di output come oggetto
                alert(data.result);
                window.location.assign('main.php');
            })
            .catch((error) => console.log(error));
        }
    }

    // lancia l'acquisto dei ricambi
    function buyPart(gid, pid, uid){
        // valori di input
        var val = {partId: pid, garageId: gid, userId: uid};
        // php da eseguire
        fetch('inc/buy_part.php', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            // passo i valori di input
            body: JSON.stringify(val)
        }).then(response => response.json())
        .then(data => {
            // prelevo i valori di output come oggetto
            alert(data.result);
        })
        .catch((error) => console.log(error));
    }

    //caricamento modelli in base al brand
    function loadModels(){
        // prendo il valore del brand selezionato
        var brand = document.getElementById("brand");
        var model = document.getElementById("model");
        // valori di input
        var val = {brandId: brand.value};
        // php da eseguire
        fetch('inc/load_models.php', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            // passo i valori di input
            body: JSON.stringify(val)
        }).then(response => response.json())
        .then(data => {
            // prelevo i valori di output come oggetto
            model.innerHTML = data.result;
        })
        .catch((error) => console.log(error));
    }

    // sezione per gestire la banda del gap

   

    
</script>