<?php
    include('inc/session.php');
    include('inc/main_class.php');
    addCarKm($_SESSION['userCar'],'5');
    $page='Used Cars Dealer';
    // prendo tutte le auto con utente -1 (concessionario usato)
    $cars = getUserGarage(-1);
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-7 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Used Cars List</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body big">
                    <table class="text-center" style="width:100%">
                        <tr>
                            <th class="status-bar-field">Brand</th>  
                            <th class="status-bar-field">Name</th>
                            <th class="status-bar-field">Cv</th>
                            <th class="status-bar-field">Nm</th>
                            <th class="status-bar-field">Kg</th>
                            <th class="status-bar-field">Km</th>
                            <th class="status-bar-field">Index</th>
                            <th class="status-bar-field">Price</th>
                            <th class="status-bar-field">View</th>
                        </tr>
                        <?php 
                            foreach ($cars as $car){
                                echo "<tr>";
                                echo "<td class=\"status-bar-field\">".$car['brandName']."</td>";
                                echo "<td class=\"status-bar-field\">".$car['carName']."</td>";
                                echo "<td class=\"status-bar-field\">".$car['cv']."</td>";
                                echo "<td class=\"status-bar-field\">".$car['nm']."</td>";
                                echo "<td class=\"status-bar-field\">".numberFormatZero($car['kg'])."</td>";
                                echo "<td class=\"status-bar-field\">".numberFormatZero($car['km'])."</td>";
                                echo "<td class=\"status-bar-field\">".numberFormat($car['statIndex'])."</td>";
                                echo "<td class=\"status-bar-field\">".euroFormat($car['sellPrice'])."</td>";
                                echo "<td class=\"status-bar-field\"><a href=\"single_car.php?t=u&c=".$car['garageId']."\">Details</a></td>";
                                echo "</tr>";
                            }
                        ?>
                    </table>
                    <button class="mt-2" onclick="location.href='map.php';">Back to the City</button>
                </div>
            </div>
        </div>
    </main>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>
    
</body>
</html>