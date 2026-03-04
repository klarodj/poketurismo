<?php
    include('connect.php');
    header('Content-Type: application/json');
    // prelevo i valori di input come array
    $input_data = json_decode(file_get_contents('php://input'), true);
    $carId = $input_data['carId'];
    $userId = $input_data['userId'];
    $sql="
        UPDATE users
        SET carDrive = $carId
        WHERE id = $userId
    ";
    if ($db->query($sql) === TRUE) {
        $result = 'Updated!';
    }else{
        $result = 'Error!'.$db->error;
    }
    // carico i valori di output come array
    $output_data = [
        'result' => $result
    ];
    // invio i valori di output
    echo json_encode($output_data);
    $db->close();
    exit;
?>