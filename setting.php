<?php
    include('inc/session.php');
    $page='Settings'
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Settings</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <img src="img/setting.png" alt="map" class="map mb-2">
                    <button class="mt-2" onclick="location.href='opponent-builder.php';">Opponent Builder</button>
                    <button class="mt-2" onclick="location.href='track-builder.php';">Track Builder</button>
                    <button class="mt-2" onclick="location.href='race-builder.php';">Race Builder</button>
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