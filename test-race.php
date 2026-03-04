<?php
    include('inc/session.php');
    include('inc/connect.php');
    $page='Test-Race';
    $tracks = array();
    $sql="
        SELECT * 
        FROM tracks
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($tracks,$row);
    }
    $opponents = array();
    $sql="
        SELECT * 
        FROM users
        WHERE class = 'opponent'
    ";
    $result = $db->query($sql);
    while($row = $result->fetch_assoc()){
        array_push($opponents,$row);
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
                    <div class="title-bar-text">Test Race</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <form action="race.php" method="post">
                        <label for="track">Choose a track:</label>
                        <select name="track" id="track">
                        <?php
                            foreach($tracks as $track){
                                echo "<option value=\"".$track['id']."\">".ucfirst($track['name'])."</option>";
                            }
                        ?>
                        </select>

                        <label for="opponent">Choose an opponent:</label>
                        <select name="opponent" id="opponent">
                        <?php
                            foreach($opponents as $opponent){
                                echo "<option value=\"".$opponent['id']."\">".ucfirst($opponent['username'])."</option>";
                            }
                        ?>
                        </select><br>
                        
                        <button class="mt-2" type="submit">Let's Race!</button>
                    </form>
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