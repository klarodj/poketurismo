<?php
    include('inc/session.php');
    include('inc/connect.php');
    $page='Track Builder';
    $trackType = array();
    $sql="
        SELECT * 
        FROM trackType
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($trackType,$row);
    }
    $trackSurfaces = array();
    $sql="
        SELECT * 
        FROM trackSurfaces
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($trackSurfaces,$row);
    }
    $trackMeteo = array();
    $sql="
        SELECT * 
        FROM trackMeteo
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($trackMeteo,$row);
    }
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Track Builder</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <form action="trackBuild.php" method="post">
                        <div class="form-group">
                            <label for="name">Track name</label>
                            <input type="text" name="name" id="name" class="form-control" required>
                            <label for="type">Choose a type:</label>
                            <select name="type" id="type" class="form-control" required>
                            <?php
                                foreach($trackType as $type){
                                    echo "<option value=\"".$type['id']."\">".ucfirst($type['name'])."</option>";
                                }
                            ?>
                            </select>
                            <label for="lenght">Lenght</label>
                            <input type="text" name="lenght" id="lenght" class="form-control" required>
                            <label for="elevation">Elevation</label>
                            <input type="text" name="elevation" id="elevation" class="form-control" required>
                            <label for="surface">Choose a surface:</label>
                            <select name="surface" id="surface" class="form-control" required>
                            <?php
                                foreach($trackSurfaces as $surface){
                                    echo "<option value=\"".$surface['id']."\">".ucfirst($surface['name'])."</option>";
                                }
                            ?>
                            </select>
                            <label for="meteo">Choose a meteo:</label>
                            <select name="meteo" id="meteo" class="form-control" required>
                            <?php
                                foreach($trackMeteo as $meteo){
                                    echo "<option value=\"".$meteo['id']."\">".ucfirst($meteo['name'])."</option>";
                                }
                            ?>
                            </select>
                        </div>
                        <button class="mt-2" type="submit">Create Track!</button>
                    </form>
                    <button class="mt-2" onclick="location.href='setting.php';">Back</button>
                </div>
            </div>
        </div>
    </main>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>

    <?php $db->close(); ?>
</body>
</html>