<?php
    include('inc/session.php');
    include('inc/connect.php');
    $page='Race Builder';
    
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Race Builder</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    <form action="raceBuild.php" method="post">
                        <div class="form-group">
                            
                        </div>
                        <button class="mt-2" type="submit">Create Race!</button>
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