<?php
    include('inc/login_script.php'); // Includes Login Script
    if(isset($_SESSION['login_user'])){
        header("location: main.php");
    }
    $page = 'Login';
?>
<!DOCTYPE html>
<html lang="en">

<?php include('inc/head.php'); ?>

<body>
    
    <main class="container">
        <div class="row justify-content-center">
            <div class="col-lg-4 my-5 text-center">
                <img src="img/logo.png" alt="logo" class="logo">
            </div>
        </div>
        <div class="row justify-content-center vh-80">
            <?php 
                if ($error<>""){
            ?>
            <div class="modal fade show" id="error" tabindex="-1" role="dialog" aria-labelledby="errorLabel" aria-modal="true" style="display: block;">
                <div class="modal-dialog" role="document">
                    <div class="modal-content window">
                        <div class="title-bar">
                            <div class="title-bar-text">Error!</div>
                            <div class="title-bar-controls">
                                <button aria-label="Close" data-dismiss="modal"></button>
                            </div>
                        </div>
                        <div class="modal-body">
                        <img src="img/icon/error.png" alt="X">
                            <?php echo $error; ?>
                        </div>
                    </div>
                </div>
            </div>
            <?php
                }
            ?>
            <div class="col-lg-8 window my-auto text-center">
                <div class="title-bar">
                    <div class="title-bar-text">PokeTurismo Login</div>
                    <div class="title-bar-controls">
                      <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    <img src="img/login.png" alt="login" class="map mb-2">
                    <p> Wecolme to PokeTurismo Alpha 0.7! </p>
                    <p class="text-left"> You are about to enter the first car Adventure-Rpg-Tycoon game. The game take place in north Italy in the year 2001, and you will play a young novice driver, penniless but true petrolhead.<br>
                    You will also be able to meet new real friends and challenge them, but always remember to do maintenance on your vehicles.<br>
                    Will you end up collecting the over 200 cars in the game, or preparing race cars? The choice is yours and have fun.</p>
                    <form action="" method="post">
                        <div class="field-row-stacked">
                            <label for="username">Username</label>
                            <input id="username" name="username" type="text" />
                        </div>
                        <div class="field-row-stacked">
                            <label for="password">Password</label>
                            <input id="password" name="password" type="password" />
                        </div>
                        <input class="mt-3" name="submit" type="submit" value="Login"/>
                    </form> 
                    <button class="mt-3" onclick="location.href='sign_up.php';">Register</button>
                </div>
            </div>
        </div>
    </main>
      
    <?php include('inc/script.php'); ?>
    
</body>
</html>