<?php

    // prendo le info dell'auto in garage del cliente
    function getGarageCar($carId){
        include('connect.php');
        $userCar = array();
        $carStats = array();
        $carParts = array();
        $sql="
            SELECT cars.name as carName, brands.name as brandName, year, garages.cv as cv, garages.nm as nm, cc, garages.kg as kg, driveType, velMax, cars.0100 as car0100, engineType, wheelBase, width, brakeFront, brakeRear, wheelSize, tyreFront, tyreRear, category, image, garages.speed as speed, garages.acceleration as acceleration, garages.revving as revving, garages.transmission as transmission, garages.turnSlow as turnSlow, garages.turnFast as turnFast, garages.brake as brake, garages.traction as traction, price, logo, km, sellPrice
            FROM (garages INNER JOIN cars ON garages.car = cars.id)
            INNER JOIN brands ON cars.brand = brands.id
            WHERE garages.id='$carId'
        ";
        $result = $db->query($sql);
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $userCar = $row;
            $userCar['garageId'] = $carId;
            $carStats = [
                "speed" => $row['speed'],
                "acceleration" => $row['acceleration'],
                "revving" => $row['revving'],
                "transmission" => $row['transmission'],
                "turnSlow" => $row['turnSlow'],
                "turnFast" => $row['turnFast'],
                "brake" => $row['brake'],
                "traction" => $row['traction']
            ];
            $userCar['carStats'] = $carStats;
            $carStats = array_filter($carStats);
            $userCar['statAvg'] = array_sum($carStats)/count($carStats);
            $userCar['statSum'] = array_sum($carStats);
            $userCar['statIndex'] = ($userCar['statAvg']+$userCar['statSum'])/2;
            $sql="
                SELECT parts.name as name, parts.description as description, parts.level as level
                FROM mods
                INNER JOIN parts ON mods.part = parts.id
                WHERE mods.car = '$carId'
            ";
            $result = $db->query($sql);
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()){
                    array_push($carParts,$row);
                }
                $userCar['carParts'] = $carParts;
            }else{
                $userCar['carParts'] = '';
            }
            return $userCar;
        }
        $db->close();
    }

    // prelevo le info standard di un auto
    function getCarInfo($carId){
        include('connect.php');
        $car = array();
        $carStats = array();
        $sql="
            SELECT cars.id as carId, cars.name as carName, brands.name as brandName, year, cv, nm, cc, kg, driveType, velMax, cars.0100 as car0100, engineType, wheelBase, width, brakeFront, brakeRear, wheelSize, tyreFront, tyreRear, category, image, speed, acceleration, revving, transmission, turnSlow, turnFast, brake, traction, price, logo, brands.id as brandId
            FROM cars 
            INNER JOIN brands ON cars.brand = brands.id
            WHERE cars.id='$carId'
        ";
        $result = $db->query($sql);
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $car = $row;
            $carStats = [
                "speed" => $row['speed'],
                "acceleration" => $row['acceleration'],
                "revving" => $row['revving'],
                "transmission" => $row['transmission'],
                "turnSlow" => $row['turnSlow'],
                "turnFast" => $row['turnFast'],
                "brake" => $row['brake'],
                "traction" => $row['traction']
            ];
            $car['carStats'] = $carStats;
            $carStats = array_filter($carStats);
            $car['statAvg'] = array_sum($carStats)/count($carStats);
            $car['statSum'] = array_sum($carStats);
            $car['statIndex'] = ($car['statAvg']+$car['statSum'])/2;
            $sql="
                SELECT parts.name as name, parts.description as description, parts.level as level
                FROM mods
                INNER JOIN parts ON mods.part = parts.id
                WHERE mods.car = '$carId'
            ";
            $result = $db->query($sql);
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()){
                    array_push($carParts,$row);
                }
                $car['carParts'] = $carParts;
            }else{
                $car['carParts'] = '';
            }
            return $car;
        }
        $db->close();
    }

    // prelevo l'elenco delle auto nel garage dell'utente
    function getUserGarage($userId){
        include('connect.php');
        $cars = array();
        $car = array();
        $sql="
            SELECT *
            FROM garages
            WHERE user='$userId'
        ";
        $result = $db->query($sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()){
                $car = getGarageCar($row['id']);
                array_push($cars, $car);
            }
            return $cars;
        }
        $db->close();
    }
    
    // formatto in numero con decimali
    function numberFormat($num){
        $num = number_format($num, 2,",",".");
        return $num;
    }

    // formatto in numero intero
    function numberFormatZero($num){
        $num = number_format($num, 0,",",".");
        return $num;
    }

    // formatto in euro
    function euroFormat($num){
        $num = number_format($num, 2,",",".")."€";
        return $num;
    }

    // formatto in percentuale
    function percentFormat($num){
        $num = number_format($num, 2,",",".")."%";
        return $num;
    }

    // prendo le info sull'utente
    function getUserInfo($userId){
        include('connect.php');
        $user = array();
        $sql="
            SELECT * 
            FROM users 
            WHERE id='$userId'
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $user['userId'] = $row['id'];
        $user['userName'] = $row['username'];
        $user['userAvatar'] = $row['avatar'];
        $user['userLevel'] = $row['level'];
        $user['userExp'] = $row['exp'];
        $user['userMoney'] = $row['money'];
        $user['userClass'] = $row['class'];
        $user['userCar'] = $row['carDrive'];
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
        $user['userStats'] = $userStats;
        return $user;
        $db->close();
    }

    // prendo info sul tracciato
    function getTrackInfo($trackId){
        include('connect.php');
        $track = array();
        $sections = array();
        // prendo i dati del tracciato
        $sql="
            SELECT tracks.id as id, tracks.name as name, lenght, elevation, trackType.name as type, trackType.image as image, trackSurfaces.name as surface, trackMeteo.name as meteo 
            FROM ((tracks INNER JOIN trackType ON tracks.type = trackType.id) 
            INNER JOIN trackSurfaces ON tracks.surface = trackSurfaces.id)
            INNER JOIN trackMeteo ON tracks.meteo = trackMeteo.id
            WHERE tracks.id='$trackId'
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $track['trackId'] = $row['id'];
        $track['trackName'] = $row['name'];
        $track['trackType'] = $row['type'];
        $track['trackLenght'] = $row['lenght'];
        $track['trackElevation'] = $row['elevation'];
        $track['trackSurface'] = $row['surface'];
        $track['trackMeteo'] = $row['meteo'];
        $track['trackImage'] = $row['image'];
        // mi prendo i dati delle sezioni
        $sql = "
            SELECT *
            FROM trackBuild INNER JOIN trackSections ON trackBuild.section = trackSections.id
            WHERE trackBuild.track = $trackId
            ORDER BY trackBuild.ord ASC
        ";
        $result = $db->query($sql);
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()){
                // come id uso in numero d'ordine della sezione
                $sections[$row['ord']] = $row;
            }
            // salvo l'array sezioni come campo dell'array traccia
            $track['trackSections'] = $sections;
        }
        return $track;
        $db->close();
    }

    // funzione per aggiungere km all'auto
    function addCarKm($carId, $km){
        include('connect.php');
        $sql="
            UPDATE garages
            SET km = km + $km
            WHERE id = $carId
        ";
        $result = $db->query($sql);
        $db->close();
    }

    // funzione per gestione premi vincita
    function winHandle($opponent){
        include('connect.php');
        $exp = $opponent['userExp'];
        $money = $opponent['userMoney'];
        $user = $_SESSION['userId'];
        $sql="
            UPDATE users
            SET exp = exp + $exp, money = money +$money
            WHERE id = $user
        ";
        $result = $db->query($sql);
        $db->close();
    }
?>