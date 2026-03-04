<?php
    include('inc/login_sc.php'); // Includes Login Script
    if(isset($_SESSION['login_user'])){
        header("location: main.php");
    }
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
            <div class="card-header text-center"><img class="logo-img" src="../cat/img/logo.svg" alt="Estendo "><br><span class="splash-description">Accedi inserendo i tuoi dati.</span></div>
            <div class="card-body">
                <form action="" method="post">
                    <div class="form-group">
                        <input class="form-control form-control-lg" id="username" name="username" type="text" placeholder="Username" autocomplete="off" required>
                    </div>
                    <div class="form-group">
                        <input class="form-control form-control-lg" id="password" name="password" type="password" placeholder="Password" required>
                    </div>
                    <div class="form-group">
                        <label class="custom-control custom-checkbox">
                            <input class="custom-control-input" type="checkbox" name="remember"><span class="custom-control-label">Ricordami</span>
                        </label>
                    </div>
                    <input name="submit" type="submit" value=" Accedi " class="btn btn-primary btn-lg btn-block">
                    <span class="text-center text-danger"><?php echo $error; ?></span>
                </form>
            </div>
            <div class="card-footer bg-white p-0  text-center">
                <div class="card-footer-item card-footer-item-bordered">
                    <a href="pg/forgot-password.php" class="footer-link">Password dimenticata</a>
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