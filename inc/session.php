<?php
    include('connect.php');
    session_start();// Starting Session
    $user_check=$_SESSION['userLogin'];
    if (isset($user_check)) { //se ho fatto login
        // SQL Query To Fetch Complete Information Of User
        $sql="
            SELECT * 
            FROM users 
            WHERE username='$user_check'
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $_SESSION['userId'] = $row['id'];
        $_SESSION['userAvatar'] = $row['avatar'];
        $_SESSION['userLevel'] = $row['level'];
        $_SESSION['userExp'] = $row['exp'];
        $_SESSION['userMoney'] = $row['money'];
        $_SESSION['userClass'] = $row['class'];
        $_SESSION['userCar'] = $row['carDrive'];
        $userStats = array(
            "brave" => $row['brave'],
            "clean" => $row['clean'],
            "reflex" => $row['reflex'],
            "acro" => $row['acro'],
            "turn" => $row['turn'],
            "brake" => $row['brake'],
            "throttle" => $row['throttle'],
            "shift" => $row['shift']
        );
        $_SESSION['userStats'] = $userStats;
        // SQL Query to fetch car name
        $carIds = $row['carDrive'];
        $sql="
            SELECT cars.name as carName, brands.name as brandName, image
            FROM (garages INNER JOIN cars ON garages.car = cars.id)
            INNER JOIN brands ON cars.brand = brands.id
            WHERE garages.id='$carIds'
        ";
        $result = $db->query($sql);
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $_SESSION['carName'] = $row['brandName']." ".$row['carName'];
            $_SESSION['carImage'] = $row['image'];
        }
        $db->close(); // Closing Connection
    }else{ //se non ho fatto login
        $db->close(); // Closing Connection
        session_destroy();
        header('Location: ../index.php'); // Redirecting To Login Page
    }
?>