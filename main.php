<?php
    include('inc/session.php');
    $page='Pocket Racing Simulator';
    include('inc/main_class.php');
    $userCar = getGarageCar($_SESSION['userCar']);
    $userGarage = getUserGarage($_SESSION['userId']);
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-7 window my-auto dashboard">
                <div class="title-bar">
                    <div class="title-bar-text">Dashboard</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    <section class="tabs">
                        <menu role="tablist" aria-label="Sample Tabs">
                            <button role="tab" aria-selected="true" aria-controls="tab-A">Garage</button>
                            <button role="tab" aria-controls="tab-B">Car</button>
                            <button role="tab" aria-controls="tab-C">You</button>
                        </menu>
                        <!-- the tab content -->
                        <article role="tabpanel" id="tab-A">
                            <img src="img/garage.png" alt="garage" class="map mb-2">
                            <table class="garage" style="width:100%">
                                <tr>
                                    <th class="status-bar-field">Sel</th>
                                    <th class="status-bar-field">Name</th>
                                    <th class="status-bar-field">Index</th>
                                    <th class="status-bar-field">CV</th>
                                    <th class="status-bar-field">NM</th>
                                    <th class="status-bar-field">KG</th>
                                    <th class="status-bar-field">Sell</th>
                                </tr>
                                <?php 
                                    if ($userGarage){
                                        foreach($userGarage as $car){
                                            echo "<tr>";
                                            if($car['garageId']==$_SESSION['userCar']){
                                                echo "<td class=\"status-bar-field\"> - </td>";
                                            }else{
                                                echo "<td class=\"status-bar-field\"><button onclick=\"selectCar(".$car['garageId'].",".$_SESSION['userId'].")\">Select</button></td>";
                                            }
                                            echo "<td class=\"status-bar-field\">".$car['brandName']." ".$car['carName']."</td>";
                                            echo "<td class=\"status-bar-field\">".numberFormat($car['statIndex'])."</td>";
                                            echo "<td class=\"status-bar-field\">".$car['cv']."</td>";
                                            echo "<td class=\"status-bar-field\">".$car['nm']."</td>";
                                            echo "<td class=\"status-bar-field\">".numberFormatZero($car['kg'])."</td>";
                                            echo "<td class=\"status-bar-field\"><button onclick=\"sellCar(".$car['garageId'].",".$_SESSION['userId'].")\">Sell</button></td>";
                                            echo "</tr>";
                                        } 
                                    }
                                ?>
                            </table>
                        </article>
                        <article role="tabpanel" hidden id="tab-B" class="">
                            <div class="row">
                                <div class="col">
                                    <p><b>Brand:</b> <?php echo $userCar['brandName']; ?> <b>Model:</b> <?php echo $userCar['carName']; ?> <b>Year:</b> <?php echo $userCar['year']; ?></p>
                                    <p><b>CV:</b> <?php echo $userCar['cv']; ?> <b>NM:</b> <?php echo $userCar['nm']; ?> <b>KG:</b> <?php echo numberFormatZero($userCar['kg']); ?> <b>Km:</b> <?php echo numberFormatZero($userCar['km']); ?> <a href="" data-bs-toggle="modal" data-bs-target="#carSpecMod">Spec</a></p>
                                    <p><b>INDEX: </b> <?php echo numberFormat($userCar['statIndex']); ?></p>
                                </div>
                                <div class="col">
                                    <img src="img/car/<?php echo $userCar['image']; ?>" alt="NO-CAR-IMAGE" class="carImage status-bar-field">
                                </div>
                            </div>
                            <div class="row">
                                <fieldset class="col">
                                    <legend class="legend text-center">Car Stats:</legend>
                                    <?php
                                        foreach($userCar['carStats'] as $stat => $value){
                                            echo "<p><b>".ucfirst($stat).":</b> $value</p>";
                                            echo "<div class=\"progress\">";
                                            echo "<div class=\"pbar\" style=\"width: ".$value."%\"></div>";
                                            echo "</div>";
                                        }
                                    ?>
                                </fieldset>
                                <fieldset class="col">
                                    <legend class="legend">Car Parts:</legend>
                                    <table class="garage" style="width:100%">
                                        <tr>
                                            <th class="status-bar-field">Type</th>
                                            <th class="status-bar-field">Description</th>
                                            <th class="status-bar-field">Level</th>
                                        </tr>
                                        <?php 
                                            if($userCar['carParts']){
                                                foreach($userCar['carParts'] as $part => $value){
                                                    echo "<tr>";
                                                    echo "<td class=\"status-bar-field\">".$value['name']."</td>";
                                                    echo "<td class=\"status-bar-field\">".$value['description']."</td>";
                                                    echo "<td class=\"status-bar-field\">".$value['level']."</td>";
                                                    echo "</tr>";
                                                }
                                            }
                                        ?>
                                    </table>
                                </fieldset>
                            </div>
                        </article>
                        <article role="tabpanel" hidden id="tab-C" class="text-center">
                            <div class="row">
                                <div class="col">
                                    <h4>Welcome <?php echo ucfirst($_SESSION['userLogin']); ?>!</h4>
                                    <p><b>Level:</b> <?php echo $_SESSION['userLevel']; ?> <b>Experience:</b> <?php echo $_SESSION['userExp']; ?> <b>Money:</b> <?php echo euroFormat($_SESSION['userMoney']); ?></p>
                                    <p><b>Class:</b> <?php echo $_SESSION['userClass']; ?></p>
                                </div>
                                <div class="col">
                                    <img src="img/avt/<?php echo $_SESSION['userAvatar']; ?>" alt="NO-AVATAR" class="avatar status-bar-field">
                                </div>
                            </div>
                            <fieldset>
                                <legend class="legend text-center">Player Stats:</legend>
                                <?php
                                    foreach($_SESSION['userStats'] as $stat => $value){
                                        echo "<p><b>".ucfirst($stat).":</b> $value</p>";
                                        echo "<div class=\"progress\">";
                                        echo "<div class=\"pbar\" style=\"width: ".$value."%\"></div>";
                                        echo "</div>";
                                    }
                                ?>
                            </fieldset>
                        </article>
                    </section>
                </div>
            </div>
        </div>
    </main>

    <div class="modal fade" id="carSpecMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Car Specs</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p><b>Category:</b> <?php echo $userCar['category']; ?></p>
                    <p><b>Engine Size:</b> <?php echo numberFormatZero($userCar['cc']); ?> CC</p>
                    <p><b>Power:</b> <?php echo $userCar['cv']; ?> CV</p>
                    <p><b>Torque:</b> <?php echo $userCar['nm']; ?> NM</p>
                    <p><b>Weight:</b> <?php echo numberFormatZero($userCar['kg']); ?> Kg</p>
                    <p><b>Max Velocity:</b> <?php echo $userCar['velMax']; ?> Km/h</p>
                    <p><b>0-100:</b> <?php echo $userCar['car0100']; ?> sec</p>
                    <p><b>Drive Type:</b> <?php echo $userCar['driveType']; ?></p>
                    <p><b>Engine Type:</b> <?php echo $userCar['engineType']; ?></p>
                    <p><b>Width:</b> <?php echo $userCar['width']; ?> cm</p>
                    <p><b>Wheel Base:</b> <?php echo $userCar['wheelBase']; ?> cm</p>
                    <p><b>Wheel Size:</b> <?php echo $userCar['wheelSize']; ?> inch</p>
                    <p><b>Front Brake Size:</b> <?php echo $userCar['brakeFront']; ?> mm</p>
                    <p><b>Rear Brake Size:</b> <?php echo $userCar['brakeRear']; ?> mm</p>
                    <p><b>Front Tyre Size:</b> <?php echo $userCar['tyreFront']; ?> mm</p>
                    <p><b>Rear Tyre Size:</b> <?php echo $userCar['tyreRear']; ?> mm</p>
                </div>
            </div>
        </div>
    </div>


    <?php include('inc/phone.php') ?>

    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>
</body>
</html>