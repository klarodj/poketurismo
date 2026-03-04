<?php
    $brandId = $_GET['b'];
    include('inc/session.php');
    include('inc/connect.php');
    $sql="
        SELECT name 
        FROM brands 
        WHERE id = $brandId
    ";
    $result = $db->query($sql);
    $row = $result->fetch_assoc();
    $page = $row['name']." New Cars";
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto overflow-auto">
                <div class="title-bar">
                    <div class="title-bar-text"><?php echo $page; ?></div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center big">
                    <?php
                        $sql="
                            SELECT * 
                            FROM cars
                            WHERE brand = $brandId
                        ";
                        $result = $db->query($sql);
                        while($row = $result->fetch_assoc()){
                            echo "<p class=\"status-bar-field carTitle\"><a href=\"single_car.php?t=n&c=".$row['id']."\"><img src=\"img/car/".$row['image']."\" alt=\"".$row['name']."\" class=\"carImage\"><br>".$row['name']."</a></p>";
                        }
                    ?>
                    <button class="mt-2" onclick="location.href='brands.php';">Back</button>
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