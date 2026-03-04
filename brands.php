<?php
    include('inc/session.php');
    $page='New Cars Brands';
    include('inc/connect.php');
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto overflow-auto">
                <div class="title-bar">
                    <div class="title-bar-text">New Cars Brands</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center big">
                    <?php
                        $sql="
                            SELECT * 
                            FROM brands 
                        ";
                        $result = $db->query($sql);
                        while($row = $result->fetch_assoc()){
                            echo "<p><a href=\"brand_cars.php?b=".$row['id']."\"><img src=\"img/brand/".$row['logo']."\" alt=\"".$row['name']."\" class=\"brand\"> <h4>".$row['name']."</h4></a></p>";
                        }
                    ?>
                    <button class="mt-2" onclick="location.href='dealer.php';">Back</button>
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