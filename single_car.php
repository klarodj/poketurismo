<?php
    $carId = $_GET['c'];
    $type = $_GET['t'];
    include('inc/session.php');
    include('inc/connect.php');
    include('inc/main_class.php');
    // se arriva dal nuovo o dall'usato
    if ($type == 'n'){
        $car = getCarInfo($carId);
    }else if($type == 'u'){
        $car = getGarageCar($carId);
    } 
    $page = $car['carName']." Page";
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text"><?php echo $page; ?></div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <div class="row">
                        <div class="col">
                            <p><b>Brand:</b> <?php echo $car['brandName']; ?> <b>Model:</b> <?php echo $car['carName']; ?> <b>Year:</b> <?php echo $car['year']; ?></p>
                            <p><b>CV:</b> <?php echo $car['cv']; ?> <b>NM:</b> <?php echo $car['nm']; ?> <b>KG:</b> <?php echo numberFormatZero($car['kg']); ?> <a href="" data-bs-toggle="modal" data-bs-target="#carSpecMod">Spec</a></p>
                            <p><b>INDEX: </b> <?php echo numberFormat($car['statIndex']); ?></p>
                        </div>
                        <div class="col">
                            <img src="img/car/<?php echo $car['image']; ?>" alt="NO-CAR-IMAGE" class="carImage status-bar-field">
                        </div>
                    </div>
                    <div class="row">
                        <fieldset class="col">
                            <legend class="legend">Car Stats:</legend>
                            <?php
                                if ($car['carStats']){
                                    foreach($car['carStats'] as $stat => $value){
                                        echo "<div class=\"field-row\">";
                                        echo "<p><b>".ucfirst($stat).":</b> $value</p>";
                                        echo "</div>";
                                    }
                                } 
                            ?>
                        </fieldset>
                        <?php 
                            if ($type == 'u'){
                        ?>
                        <filedset class="col">
                            <legend class="legend">Car Parts:</legend>
                            <table class="garage" style="width:100%">
                                <tr>
                                    <th class="status-bar-field">Type</th>
                                    <th class="status-bar-field">Description</th>
                                    <th class="status-bar-field">Level</th>
                                </tr>
                                <?php 
                                    if ($car['carParts']){
                                        foreach($car['carParts'] as $part => $value){
                                            echo "<tr>";
                                            echo "<td class=\"status-bar-field\">".$value['name']."</td>";
                                            echo "<td class=\"status-bar-field\">".$value['description']."</td>";
                                            echo "<td class=\"status-bar-field\">".$value['level']."</td>";
                                            echo "</tr>";
                                        }
                                    }
                                ?>
                            </table>
                        </filedset>
                        <?php 
                            }
                        ?>
                    </div>
                    <p><h4>Price:</h4> <?php echo ($type == 'n') ? euroFormat($car['price']) : euroFormat($car['sellPrice']) ; ?></p>
                    <button class="" onclick="buyCar(<?php echo '\'',$type.'\','.$carId.','.$_SESSION['userId']; ?>)">Buy</button> 
                    <?php 
                        if($type=='n'){
                    ?>
                    <button class="" onclick="location.href='brand_cars.php?b=<?php echo $car['brandId']; ?>';">Back</button>
                    <?php 
                        }else if($type == 'u'){
                    ?>
                    <button class="" onclick="location.href='used_list.php';">Back</button>
                    <?php 
                        }
                    ?>
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
                        <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p><b>Category:</b> <?php echo $car['category']; ?></p>
                    <p><b>Engine Size:</b> <?php echo numberFormatZero($car['cc']); ?> CC</p>
                    <p><b>Power:</b> <?php echo $car['cv']; ?> CV</p>
                    <p><b>Torque:</b> <?php echo $car['nm']; ?> NM</p>
                    <p><b>Weight:</b> <?php echo numberFormatZero($car['kg']); ?> Kg</p>
                    <p><b>Max Velocity:</b> <?php echo $car['velMax']; ?> Km/h</p>
                    <p><b>0-100:</b> <?php echo $car['car0100']; ?> sec</p>
                    <p><b>Drive Type:</b> <?php echo $car['driveType']; ?></p>
                    <p><b>Engine Type:</b> <?php echo $car['engineType']; ?></p>
                    <p><b>Width:</b> <?php echo $car['width']; ?> cm</p>
                    <p><b>Wheel Base:</b> <?php echo $car['wheelBase']; ?> cm</p>
                    <p><b>Wheel Size:</b> <?php echo $car['wheelSize']; ?> inch</p>
                    <p><b>Front Brake Size:</b> <?php echo $car['brakeFront']; ?> mm</p>
                    <p><b>Rear Brake Size:</b> <?php echo $car['brakeRear']; ?> mm</p>
                    <p><b>Front Tyre Size:</b> <?php echo $car['tyreFront']; ?> mm</p>
                    <p><b>Rear Tyre Size:</b> <?php echo $car['tyreRear']; ?> mm</p>
                </div>
            </div>
        </div>
    </div>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>

    <?php $db->close(); ?>
</body>
</html>