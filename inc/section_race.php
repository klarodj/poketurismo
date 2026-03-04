<?php
    $raceScores = array();
    // se non sono appena entrato e sono prima della fine
    if(isset($_POST['ord']) && $ord <= $track['trackLenght']){
        // mi prendo i dati della sezione attuale
        $raceSection = $track['trackSections'][$ord];
        // mi calcolo la differenza fra la stat dell'auto del giocatore contro quella dell'avversario
        $raceScores['carStat'] = $playerCar['carStats'][$raceSection['carStat']] - $opponentCar['carStats'][$raceSection['carStat']];
        $raceScores['carTech'] = $playerCar['carStats'][$raceSection['carTech']] - $opponentCar['carStats'][$raceSection['carTech']];
        // mi calcolo la differenza fra la stat del giocatore contro quelle dell'avversario
        $raceScores['driverStat'] = $_SESSION['userStats'][$raceSection['driverStat']] - $opponent['userStats'][$raceSection['driverStat']];
        $raceScores['driverTech'] = $_SESSION['userStats'][$raceSection['driverTech']] - $opponent['userStats'][$raceSection['driverTech']];
        // sommo le differenze
        $raceDiff = array_sum($raceScores);
        // verifico di quanto modificare il gap
        if ($raceDiff > 20){
            $gap += 3;
        }elseif ($raceDiff > 10){
            $gap += 2;
        }elseif ($raceDiff > 0){
            $gap += 1;
        }elseif ($raceDiff < -20){
            $gap -= 3;
        }elseif ($raceDiff < -10){
            $gap -= 2;
        }elseif ($raceDiff < 0){
            $gap -= 1;
        }
        $percBar = ($gap>10) ? 10 : $gap;
        addCarKm($_SESSION['userCar'],'2.5');
        //echo $raceDiff;
    }
?>