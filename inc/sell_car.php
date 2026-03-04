<?php
    include('connect.php');
    header('Content-Type: application/json');
    // prelevo i valori di input come array
    $input_data = json_decode(file_get_contents('php://input'), true);
    $garageId = $input_data['garageId'];
    $userId = $input_data['userId'];
    // prelevo il dato dei soldi dell'utente
    $sql="
        SELECT money
        FROM users
        WHERE id = $userId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    $userMoney = $row['money'];
    // prendo il prezzo di acquisto dell'auto e lo divido per due
    $sql="
        SELECT cars.price as price
        FROM cars
        INNER JOIN garages ON cars.id = garages.car
        WHERE garages.id = $garageId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    $carPrice = $row['price']/2;
    // verifico se ci sono mod installate
    $slq="
        SELECT id
        FROM mods
        WHERE car = $garageId
    ";
    $result = $db->query($sql);
    if ($result->num_rows > 0) {
        // aumento il valore di vendita
        $carPrice *= (1+(2*$result->num_rows)/100);
    }
    $userMoney = $userMoney + $carPrice;
    // tolgo l'auto dal garage dell'utente e la metto nel mercato dell'usato
    $sql="
        UPDATE garages
        SET user = '-1', sellPrice = $carPrice
        WHERE id = $garageId
    ";
    // aggiorno i soldi dell'utente
    $sql2="
        UPDATE users
        SET money = $userMoney
        WHERE id = $userId 
    ";
    if($db->query($sql) == TRUE && $db->query($sql2) == TRUE){
        $reply = 'You sell your car!';
    }else{
        $reply = 'Error!'.$db->error;
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