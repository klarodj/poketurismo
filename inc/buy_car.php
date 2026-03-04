<?php
    include('connect.php');
    include('main_class.php');
    header('Content-Type: application/json');
    // prelevo i valori di input come array
    $input_data = json_decode(file_get_contents('php://input'), true);
    $carId = $input_data['carId'];
    $type = $input_data['type'];
    // se è nuovo o se è usato
    if ($type =='n'){
        // prendo i dati standard dell'auto
        $car = getCarInfo($carId);
        $carCv = $car['cv'];
        $carNm = $car['nm'];
        $carKg = $car['kg'];
        $carSpeed = $car['speed'];
        $carAcc = $car['acceleration'];
        $carRevv = $car['revving'];
        $carTrans = $car['transmission'];
        $carTSlow = $car['turnSlow'];
        $carTFast = $car['turnFast'];
        $carBrake = $car['brake'];
        $carTrac = $car['traction'];
        // verifico il prezzo dell'auto
        $sql="
            SELECT price
            FROM cars
            WHERE id = $carId
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $carPrice = $row['price'];
    }else if($type == 'u'){
        $car = getGarageCar($carId);
        $carCv = $car['cv'];
        $carNm = $car['nm'];
        $carKg = $car['kg'];
        $carSpeed = $car['speed'];
        $carAcc = $car['acceleration'];
        $carRevv = $car['revving'];
        $carTrans = $car['transmission'];
        $carTSlow = $car['turnSlow'];
        $carTFast = $car['turnFast'];
        $carBrake = $car['brake'];
        $carTrac = $car['traction'];
        $carPrice = $car['sellPrice'];
    }
    $userId = $input_data['userId'];
    // prelevo i soldi dell'utente
    $sql="
        SELECT money
        FROM users
        WHERE id = $userId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    $userMoney = $row['money'];
    // se l'utente ha abbastanza soldi
    if($userMoney >= $carPrice){
        $userMoney = $userMoney - $carPrice;
        $usedPrice = $carPrice/2;
        if ($type == 'n'){
            // aggiungo l'auto al garage dell'utente
            $sql="
                INSERT INTO garages (user, car, cv, nm, kg, speed, acceleration, revving, transmission, turnSlow, turnFast, brake, traction, sellPrice)
                VALUES ($userId , $carId, $carCv, $carNm, $carKg, $carSpeed, $carAcc, $carRevv, $carTrans, $carTSlow, $carTFast, $carBrake, $carTrac, $usedPrice) 
            ";
        }else if($type == 'u'){
            // modifico la proprietà
            $sql="
                UPDATE garages
                SET user = $userId, sellPrice = 0
                WHERE id = $carId
            ";
        }
        // scalo il costo dell'auto all'utente
        $sql2="
            UPDATE users
            SET money = $userMoney
            WHERE id = $userId 
        ";
        // se tutto va bene
        if($db->query($sql) == TRUE && $db->query($sql2) == TRUE){
            $reply = 'You get a new car!';
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