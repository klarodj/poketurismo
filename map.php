<?php
    include('inc/session.php');
    include('inc/main_class.php');
    addCarKm($_SESSION['userCar'],'5');
    $page='City Map'
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">City Map</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <img src="img/city.png" alt="map" class="map mb-2">
                    <button onclick="location.href='main.php';">Garage</button>
                    <button onclick="location.href='dealer.php';">Dealership</button>
                    <button onclick="location.href='used.php';">Used Cars</button>
                    <button onclick="location.href='shop.php';">Parts Shop</button>
                    <button onclick="location.href='workshop.php';">Workshop</button>
                    <button onclick="location.href='meet.php';">Car Meet</button>
                    <button onclick="location.href='street.php';">Sreet Racing</button>
                    <button onclick="location.href='track.php';">Race Track</button>
                </div>
            </div>
        </div>
    </main>

    <?php include('inc/phone.php') ?>
    
    <?php include('inc/nav.php'); ?>
      
    <?php include('inc/script.php'); ?>
</body>
</html>