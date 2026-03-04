<?php
    include('inc/session.php');
?>
<!doctype html>
<html lang="en">
 
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" href="img/favicon.ico" type="image/png" />
    <title>Estendo Portale - Login</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="assets/vendor/bootstrap/css/bootstrap.min.css">
    <link href="assets/vendor/fonts/circular-std/style.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/libs/css/style.css">
    <link rel="stylesheet" href="assets/vendor/fonts/fontawesome/css/fontawesome-all.css">
    <style>
    html,
    body {
        height: 100%;
    }

    body {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-align: center;
        align-items: center;
        padding-top: 40px;
        padding-bottom: 40px;
    }
    .splash-container {
        width: 100%;
        max-width: 400px;
    }
    </style>
</head>

<body>
    <!-- ============================================================== -->
    <!-- login page  -->
    <!-- ============================================================== -->
    <div class="splash-container">
        <div class="card">
            <div class="card-header text-center">
                <span class="splash-description">Seleziona la commessa.</span>  
                <?php if($login_cat_estendo == 1) { ?>  
                <a href="estendo.php"><img class="logo-img" src="../cat/img/logo.svg" alt="Estendo "></a><br>
                <?php } ?>
            </div>
                <div class="card-body d-flex justify-content-around align-items-center">
                    <?php if($login_cat_iren == 1) { ?>
                    <a href="main.php?c=i"><img src="img/iren.png" alt="iren" style="max-width:100px"></a>
                    <?php } ?>
                    <?php if($login_cat_engie == 1) { ?>
                    <a href="main.php?c=e"><img src="img/engie.png" alt="engie" style="max-width:100px"></a>
                    <?php } ?>
                </div>
            <div class="card-footer bg-white p-0  text-center">
                <div class="card-footer-item card-footer-item-bordered">
                    
                </div>
            </div>
        </div>
    </div>
  
    <!-- ============================================================== -->
    <!-- end login page  -->
    <!-- ============================================================== -->
    <!-- Optional JavaScript -->
    <script src="../assets/vendor/jquery/jquery-3.3.1.min.js"></script>
    <script src="../assets/vendor/bootstrap/js/bootstrap.bundle.js"></script>
</body>
 
</html>