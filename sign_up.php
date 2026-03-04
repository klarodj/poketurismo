<?php
    $page='Sign Up'
?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Sign Up</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    <form action="register.php" method="POST">
                        <div class="form-group">
                            <label for="username">Username:</label>
                            <input type="text" name="username" id="username" class="form-control" required>
                            <label for="password" class="mt-3">Password:</label>
                            <input type="password" name="password" id="password" class="form-control" required>
                            <label for="mail" class="mt-3">E-Mail:</label>
                            <input type="text" name="email" id="email" class="form-control" required>
                            <label for="sex" class="mt-3">Sex:</label>
                            <select name="sex" id="sex" required>
                                <option value="m">Male</option>
                                <option value="f">Female</option>
                            </select>
                        </div>
                        <div class="text-center">
                            <input type="submit" value="Register" class="mt-3">
                        </div>
                    </form>
                    <div class="text-center">
                        <button class="mt-3" onclick="location.href='index.php';">Login</button>
                    </div>
                </div>
            </div>
        </div>
    </main>
      
    <?php include('inc/script.php'); ?>
</body>
</html>