<?php
    include('inc/session.php');
    include('inc/main_class.php');
    $page='Race';
    // prendo i dati della corsa
    $trackId = $_POST['track'];
    $track = getTrackInfo($trackId);
    $opponentId = $_POST['opponent'];
    $opponent = getUserInfo($opponentId);
    $playerId = $_SESSION['userId'];
    $opponentCar = getGarageCar($opponent['userCar']);
    $playerCar = getGarageCar($_SESSION['userCar']);
 
    // se non sono al primo ingresso nella gara prendo il valore del passaggio altrimenti metto zero
     if(isset($_POST['ord']) && $_POST['ord']>0){
        $ord = $_POST['ord'];
        $gap = $_POST['gap'];
    }else{
        $ord = 0;
        $gap = 0;
        $percBar = 0;
    }
    // includo tutto lo script che gestisce la corsa
    include('inc/section_race.php');
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">

            <div class="col-lg-8 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Race</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center big">
                    <div class="row">
                        <div class="col">
                            <img src="img/track/<?php echo $track['trackImage']; ?>" alt="Track Image" class="trackImage">
                        </div>
                        <div class="col">
                            <p class="text-center"><b>Track: <?php echo ucfirst($track['trackName']); ?></b></p>
                            <p>
                                <b>Type:</b> <?php echo $track['trackType']; ?> 
                                <b>Lenght:</b> <?php echo $track['trackLenght']*2.5; ?> Km
                                <b>Elevation:</b> <?php echo $track['trackElevation']; ?> m
                            </p>
                            <p>
                                <b>Surface:</b> <?php echo ucfirst($track['trackSurface']); ?> 
                                <b>Meteo:</b> <?php echo ucfirst($track['trackMeteo']); ?>
                            </p>
                            <p>
                                <b>Sections #:</b> <?php echo $track['trackLenght']; ?>
                            </p>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-5">
                            <p><b>Driver:</b> <?php echo ucfirst($_SESSION['userLogin']); ?></p>
                            <p><b>Lev.</b> <?php echo ucfirst($_SESSION['userLevel']); ?> <a href=""  data-bs-toggle="modal" data-bs-target="#playerSkillsMod">Skills</a></p>
                        </div>
                        <div class="col-1">
                            <img src="img/avt/<?php echo $_SESSION['userAvatar']; ?>" alt="NO-AVATAR" class="avatar status-bar-field">
                        </div>
                        <div class="col-5">
                            <p><b>Opponent:</b> <?php echo ucfirst($opponent['userName']); ?></p>
                            <p><b>Lev.</b> <?php echo ucfirst($opponent['userLevel']); ?> <a href="" data-bs-toggle="modal" data-bs-target="#opponentSkillsMod">Skills</a></p>
                        </div>
                        <div class="col-1">
                            <img src="img/avt/<?php echo $opponent['userAvatar']; ?>" alt="NO-AVATAR" class="avatar status-bar-field">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <img src="img/car/<?php echo $playerCar['image']; ?>" alt="NO-CAR-IMAGE" class="carImageRace status-bar-field">
                        </div>
                        <div class="col">
                            <p><b>Car:</b> <?php echo $playerCar['brandName']." ".$playerCar['carName'] ?></p>
                            <p><b>Index:</b> <?php echo numberFormat($playerCar['statIndex']); ?> <a href="" data-bs-toggle="modal" data-bs-target="#playerCarSpecMod">Stats</a></p>
                            <p><a href="" data-bs-toggle="modal" data-bs-target="#playerCarPartsMod">Mods</a></p>
                        </div>
                        <div class="col">
                            <img src="img/car/<?php echo $opponentCar['image']; ?>" alt="NO-CAR-IMAGE" class="carImageRace status-bar-field">
                        </div>
                        <div class="col">
                            <p><b>Car:</b> <?php echo $opponentCar['brandName']." ".$opponentCar['carName'] ?></p>
                            <p><b>Index:</b> <?php echo numberFormat($opponentCar['statIndex']); ?> <a href=""  data-bs-toggle="modal" data-bs-target="#opponentCarSpecMod">Stats</a></p>
                            <p><a href="" data-bs-toggle="modal" data-bs-target="#opponentCarPartsMod">Mods</a></p>
                        </div>
                    </div>
                    <div class="row justify-content-center">
                        <!-- Visualizzo il GAP -->
                        <div class="col"></div>
                        <div class="col">
                            <p><b>GAP:</b> <?php echo $gap; ?></p>
                            <div class="graph status-bar-field">
                                <div class="ext <?php echo ($gap>0) ? 'pos' : 'neg'; ?>"><div style="width: <?php echo abs($percBar*10); ?>%;" class="bar"></div></div>
                            </div>
                        </div> CarSpec
                        <div class="col"></div>
                    </div>
                    <div class="row mt-3">
                        <table>
                            <tr>
                                <th>Order</th>
                                <th>Name</th>
                                <th>Status</th>
                            </tr>
                        <?php
                            foreach($track['trackSections'] as $section){
                                echo "<tr>";
                                echo "<td>".$section['ord']."</td>";
                                echo "<td>".$section['name']."</td>";
                                if($ord == $section['ord']){
                                    echo  "<td> <-- </td>";
                                }
                                echo "</tr>";
                            }
                        ?>
                        </table>
                        <form action="" method="POST">
                            <input type="hidden" id="track" name="track" value="<?php echo $trackId; ?>">
                            <input type="hidden" id="opponent" name="opponent" value="<?php echo $opponentId; ?>">
                            <input type="hidden" id="gap" name="gap" value="<?php echo $gap; ?>">
                            <input type="hidden" id="ord" name="ord" value="<?php echo $ord+1; ?>">
                            <?php 
                                // se sono all'inizio
                                if($ord == 0){
                            ?>
                                <button action="submit">Start the Race!</button>
                            <?php
                                }elseif($ord <= $track['trackLenght']){
                                // se non sono a fine gara
                            ?>
                                <button action="submit">Race Next Section</button>
                            <?php 
                                }
                            ?>
                        </form>
                    </div>
                    <?php 
                        if($ord > $track['trackLenght']){
                            echo "<h3>Race Finished!</h3>";
                            if ($gap > 0){
                                winHandle($opponent);
                                echo "<h4>You Win!</h4>";
                            }else{
                                echo "<h4>You Lose!</h4>";
                            }
                        }
                    ?>
                    <button class="mt-2" onclick="location.href='test-race.php';">Exit Race</button>
                </div>
            </div>

        </div>
    </main>

    <div class="modal fade" id="playerSkillsMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Player Skills</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <?php
                        foreach($_SESSION['userStats'] as $stat => $value){
                            echo "<p><b>".ucfirst($stat).":</b> $value</p>";
                            echo "<div class=\"progress\">";
                            echo "<div class=\"pbar\" style=\"width: ".$value."%\"></div>";
                            echo "</div>";
                        }
                    ?>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="opponentSkillsMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Opponent Skills</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <?php
                        foreach($opponent['userStats'] as $stat => $value){
                            echo "<p><b>".ucfirst($stat).":</b> $value</p>";
                            echo "<div class=\"progress\">";
                            echo "<div class=\"pbar\" style=\"width: ".$value."%\"></div>";
                            echo "</div>";
                        }
                    ?>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="playerCarSpecMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Player Car Specs</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p><b>Category:</b> <?php echo $playerCar['category']; ?></p>
                    <p><b>Engine Size:</b> <?php echo numberFormatZero($playerCar['cc']); ?> CC</p>
                    <p><b>Power:</b> <?php echo $playerCar['cv']; ?> CV</p>
                    <p><b>Torque:</b> <?php echo $playerCar['nm']; ?> NM</p>
                    <p><b>Weight:</b> <?php echo numberFormatZero($playerCar['kg']); ?> Kg</p>
                    <p><b>Max Velocity:</b> <?php echo $playerCar['velMax']; ?> Km/h</p>
                    <p><b>0-100:</b> <?php echo $playerCar['car0100']; ?> sec</p>
                    <p><b>Drive Type:</b> <?php echo $playerCar['driveType']; ?></p>
                    <p><b>Engine Type:</b> <?php echo $playerCar['engineType']; ?></p>
                    <p><b>Width:</b> <?php echo $playerCar['width']; ?> cm</p>
                    <p><b>Wheel Base:</b> <?php echo $playerCar['wheelBase']; ?> cm</p>
                    <p><b>Wheel Size:</b> <?php echo $playerCar['wheelSize']; ?> inch</p>
                    <p><b>Front Brake Size:</b> <?php echo $playerCar['brakeFront']; ?> mm</p>
                    <p><b>Rear Brake Size:</b> <?php echo $playerCar['brakeRear']; ?> mm</p>
                    <p><b>Front Tyre Size:</b> <?php echo $playerCar['tyreFront']; ?> mm</p>
                    <p><b>Rear Tyre Size:</b> <?php echo $playerCar['tyreRear']; ?> mm</p>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="opponentCarSpecMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Opponent Car Specs</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <p><b>Category:</b> <?php echo $opponentCar['category']; ?></p>
                    <p><b>Engine Size:</b> <?php echo numberFormatZero($opponentCar['cc']); ?> CC</p>
                    <p><b>Power:</b> <?php echo $opponentCar['cv']; ?> CV</p>
                    <p><b>Torque:</b> <?php echo $opponentCar['nm']; ?> NM</p>
                    <p><b>Weight:</b> <?php echo numberFormatZero($opponentCar['kg']); ?> Kg</p>
                    <p><b>Max Velocity:</b> <?php echo $opponentCar['velMax']; ?> Km/h</p>
                    <p><b>0-100:</b> <?php echo $opponentCar['car0100']; ?> sec</p>
                    <p><b>Drive Type:</b> <?php echo $opponentCar['driveType']; ?></p>
                    <p><b>Engine Type:</b> <?php echo $opponentCar['engineType']; ?></p>
                    <p><b>Width:</b> <?php echo $opponentCar['width']; ?> cm</p>
                    <p><b>Wheel Base:</b> <?php echo $opponentCar['wheelBase']; ?> cm</p>
                    <p><b>Wheel Size:</b> <?php echo $opponentCar['wheelSize']; ?> inch</p>
                    <p><b>Front Brake Size:</b> <?php echo $opponentCar['brakeFront']; ?> mm</p>
                    <p><b>Rear Brake Size:</b> <?php echo $opponentCar['brakeRear']; ?> mm</p>
                    <p><b>Front Tyre Size:</b> <?php echo $opponentCar['tyreFront']; ?> mm</p>
                    <p><b>Rear Tyre Size:</b> <?php echo $opponentCar['tyreRear']; ?> mm</p>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="playerCarPartsMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Player Car Parts List</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <table class="garage" style="width:100%">
                        <tr>
                            <th class="status-bar-field">Type</th>
                            <th class="status-bar-field">Description</th>
                            <th class="status-bar-field">Level</th>
                        </tr>
                        <?php
                            foreach($playerCar['carParts'] as $part => $value){
                                echo "<tr>";
                                echo "<td class=\"status-bar-field\">".$value['name']."</td>";
                                echo "<td class=\"status-bar-field\">".$value['description']."</td>";
                                echo "<td class=\"status-bar-field\">".$value['level']."</td>";
                                echo "</tr>";
                            }
                        ?>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="opponentCarPartsMod" tabindex="-1" role="dialog" aria-labelledby="carSpecModLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content window">
                <div class="title-bar">
                    <div class="title-bar-text">Opponent Car Parts List</div>
                    <div class="title-bar-controls">
                        <button aria-label="Close" data-dismiss="modal"></button>
                    </div>
                </div>
                <div class="modal-body">
                    <table class="garage" style="width:100%">
                        <tr>
                            <th class="status-bar-field">Type</th>
                            <th class="status-bar-field">Description</th>
                            <th class="status-bar-field">Level</th>
                        </tr>
                        <?php
                            foreach($opponentCar['carParts'] as $part => $value){
                                echo "<tr>";
                                echo "<td class=\"status-bar-field\">".$value['name']."</td>";
                                echo "<td class=\"status-bar-field\">".$value['description']."</td>";
                                echo "<td class=\"status-bar-field\">".$value['level']."</td>";
                                echo "</tr>";
                            }
                        ?>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>
</body>
</html>