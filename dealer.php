<?php
    include('inc/session.php');
    include('inc/main_class.php');
    addCarKm($_SESSION['userCar'],'5');
    $page='New Cars Dealership'
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">New Cars Dealership</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <img src="img/dealer.png" alt="dealer" class="dealerImage mb-2">
                    <button class="mt-2" onclick="location.href='brands.php';">Show all Brands</button>
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