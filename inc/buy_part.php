<?php
    include('connect.php');
    include('main_class.php');
    header('Content-Type: application/json');
    // prelevo i valori di input come array
    $input_data = json_decode(file_get_contents('php://input'), true);
    $partId = $input_data['partId'];
    $garageId = $input_data['garageId'];
    $userId = $input_data['userId'];
    // prelevo i dati attuali dell'auto
    $car = getGarageCar($garageId);
    // verifico se il pezzo è già montato
    $sql="
        SELECT count(id) as c
        FROM mods
        WHERE car = $garageId AND part = $partId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    // se è già presente segnalo ed esco
    if($row['c']>0){
        $reply= 'Part already installed!';
        $output_data = [
            'result' => $reply
        ];
        // invio i valori di output
        echo json_encode($output_data);
        $db->close();
        exit;
    }
    // verifico quanti soldi ha l'utente
    $sql="
        SELECT money
        FROM users
        WHERE id = $userId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    $userMoney = $row['money'];
    // prendo i dati del pezzo
    $sql="
        SELECT *
        FROM parts
        WHERE id = $partId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    // prendo i valori del pezzo e mi calcolo gli incrementi
    $partName = $row['name'];
    $partPrice = $row['price'];
    // verifico se c'è già un pezzo della stessa tipologia installato
    $sql="
        SELECT mods.id as modId, parts.id as partId
        FROM mods INNER JOIN parts ON mods.part = parts.id
        WHERE parts.name = '$partName'  and mods.car = $garageId;
    ";
    $result = $db->query($sql);
    if($result->num_rows > 0){
        $row_ = $result->fetch_assoc();
        // rimuovo il vecchio pezzo prima di installare il nuovo
        $oldModId = $row_['modId'];
        $sql="
            SELECT *
            FROM mods
            WHERE id = $oldModId
        ";
        $result = $db->query($sql);
        $row_ = $result->fetch_assoc();
        // calcolo i nuovi valori
        $carSpeed = $car['speed'] - $row_['speedValue'];
        $carAccel = $car['acceleration'] - $row_['accelValue'];
        $carRevv = $car['revving'] - $row_['revvValue'];
        $carTrans = $car['transmission'] - $row_['transValue'];
        $carTSlow = $car['turnSlow'] - $row_['turnSlowValue'];
        $carTFast = $car['turnFast'] - $row_['turnFastValue'];
        $carBrake = $car['brake'] - $row_['brakeValue'];
        $carTract = $car['traction'] - $row_['tractValue'];
        $carCv= $car['cv'] - $row_['cvValue'];
        $carNm = $car['nm'] - $row_['nmValue'];
        $carKg = $car['kg'] + $row_['kgValue'];
        $sql="
            DELETE FROM mods
            WHERE id = $oldModId
        ";
        $db->query($sql);
        // aggiorno i valore dell'auto
        $sql="
            UPDATE garages
            SET cv = '$carCv', nm = '$carNm', kg = '$carKg', speed = '$carSpeed', acceleration = '$carAccel', revving = '$carRevv', transmission = '$carTrans', turnSlow = '$carTSlow', turnFast = '$carTFast', brake = '$carBrake', traction = '$carTract'
            WHERE id = $garageId
        ";
        $result = $db->query($sql);
        // ri-prelevo i dati attuali dell'auto
        $car = getGarageCar($garageId);
    }
    // ricalcolo i valori in base al pezzo
    $partSpeed = ($row['speedBonus']>0) ? ($car['speed'] * ($row['speedBonus']/100)) : '0.00';
    $partAccel = ($row['accelBonus']>0) ? ($car['acceleration'] * ($row['accelBonus']/100)) : '0.00';
    $partRevv = ($row['revvBonus']>0) ? ($car['revving'] * ($row['revvBonus']/100)) : '0.00';
    $partTrans = ($row['transBonus']>0) ? ($car['transmission'] * ($row['transBonus']/100)) : '0.00';
    $partTurnSlow = ($row['turnSlowBonus']>0) ? ($car['turnSlow'] * ($row['turnSlowBonus']/100)) : '0.00';
    $partTurnFast = ($row['turnFastBonus']>0) ? ($car['turnFast'] * ($row['turnFastBonus']/100)) : '0.00';
    $partBrake = ($row['brakeBonus']>0) ? ($car['brake'] * ($row['brakeBonus']/100)) : '0.00';
    $partTract = ($row['tractBonus']>0) ? ($car['traction'] * ($row['tractBonus']/100)) : '0.00';
    $partCv = ($row['cvBonus']>0) ? ($car['cv'] * ($row['cvBonus']/100)) : '0.00';
    $partNm = ($row['nmBonus']>0) ? ($car['nm'] * ($row['nmBonus']/100)) : '0.00';
    $partKg = ($row['kgBonus']>0) ? ($car['kg'] * ($row['kgBonus']/100)) : '0.00';
    // se l'utente ha abbastanza soldi
    if($userMoney >= $partPrice){
        // calcolo i nuovi valori
        $userMoney = $userMoney - $partPrice;
        $carSpeed = $car['speed'] + $partSpeed;
        $carAccel = $car['acceleration'] + $partAccel;
        $carRevv = $car['revving'] + $partRevv;
        $carTrans = $car['transmission'] + $partTrans;
        $carTSlow = $car['turnSlow'] + $partTurnSlow;
        $carTFast = $car['turnFast'] + $partTurnFast;
        $carBrake = $car['brake'] + $partBrake;
        $carTract = $car['traction'] + $partTract;
        $carCv= $car['cv'] + $partCv;
        $carNm = $car['nm'] + $partNm;
        $carKg = $car['kg'] - $partKg;
        // aggiungo il pezzo alla macchina e mi salvo gli aumenti di valori della modifica
        $sql="
            INSERT INTO mods (car, part, speedValue, accelValue, revvValue, transValue, turnSlowValue, turnFastValue, brakeValue, tractValue, cvValue, nmValue, kgValue)
            VALUES ($garageId, $partId, $partSpeed, $partAccel, $partRevv, $partTrans, $partTurnSlow, $partTurnFast, $partBrake, $partTract, $partCv, $partNm, $partKg) 
        ";
        // scalo i soldi all'utente
        $sql2="
            UPDATE users
            SET money = $userMoney
            WHERE id = $userId 
        ";
        // aggiorno i valori della macchina
        $sql3="
            UPDATE garages
            SET cv = '$carCv', nm = '$carNm', kg = '$carKg', speed = '$carSpeed', acceleration = '$carAccel', revving = '$carRevv', transmission = '$carTrans', turnSlow = '$carTSlow', turnFast = '$carTFast', brake = '$carBrake', traction = '$carTract'
            WHERE id = $garageId
        ";
        if($db->query($sql) == TRUE && $db->query($sql2) == TRUE && $db->query($sql3) == TRUE){
            $reply = 'You get a new car part installed!';
        }else{
            $reply = 'Error!'.$db->error;
        }
    }else{
        $reply= 'Not enough money!';
    }
    // carico i valori di output come array
    $output_data = [
        'result' => $reply
    ];
    // invio i valori di output
    echo json_encode($output_data);
    $db->close();
    exit;
?>