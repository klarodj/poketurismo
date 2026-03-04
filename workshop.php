<?php
    include('inc/session.php');
    include('inc/main_class.php');
    addCarKm($_SESSION['userCar'],'5');
    $page='Workshop'
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto overflow-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Workshop</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center big">
                    <img src="img/workshop.png" alt="map" class="map mb-2">
                    
                    <table class="text-center mt-2" style="width:100%">
                        <tr>
                            <th class="status-bar-field">Service</th>
                            <th class="status-bar-field">Image</th>
                            <th class="status-bar-field">Description</th>
                            <th class="status-bar-field">Price</th>
                            <th class="status-bar-field">Buy</th>
                        <tr>
                        <tr>
                            <td class="status-bar-field">Change Oil</td>
                            <td class="status-bar-field"><img src="img/oil.png" alt="oil" class="partImage"></td>
                            <td class="status-bar-field">Change the engine oil after 1.000km to keep it healty</td>
                            <td class="status-bar-field">150€</td>
                            <td class="status-bar-field"><button onclick="">Buy</button></td>
                        </tr>
                        <tr>
                            <td class="status-bar-field">Change Tyres</td>
                            <td class="status-bar-field"><img src="img/tyre.png" alt="tyre" class="partImage"></td>
                            <td class="status-bar-field">Change your used and abused old tyres</td>
                            <td class="status-bar-field">500€</td>
                            <td class="status-bar-field"><button onclick="">Buy</button></td>
                        </tr>
                        <tr>
                            <td class="status-bar-field">Rebuild Engine</td>
                            <td class="status-bar-field"><img src="img/rebuild.png" alt="rebuild" class="partImage"></td>
                            <td class="status-bar-field">Rebuild a broken engine, due to bad usage</td>
                            <td class="status-bar-field">2.500€</td>
                            <td class="status-bar-field"><button onclick="">Buy</button></td>
                        </tr>
                        <tr>
                            <td class="status-bar-field">Repair Car</td>
                            <td class="status-bar-field"><img src="img/repair.png" alt="repair" class="partImage"></td>
                            <td class="status-bar-field">Repair any damage to the car that you have</td>
                            <td class="status-bar-field">3.500€</td>
                            <td class="status-bar-field"><button onclick="">Buy</button></td>
                        </tr>
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