<?php 
    include('connect.php');
    header('Content-Type: application/json');
    // prelevo i valori di input come array
    $input_data = json_decode(file_get_contents('php://input'), true);
    $brandId = $input_data['brandId'];
    $sql="
        SELECT *
        FROM cars
        WHERE brand = $brandId
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        $reply = $reply." <option value=\"".$row['id']."\">".$row['name']."</option>";
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