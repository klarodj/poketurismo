<?php 
    include('inc/connect.php');
    $sex = $_POST['sex'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $mail = $_POST['mail'];
    $sql="
        SELECT username
        FROM users
    ";
    $result = $db->query($sql);
?>
<!DOCTYPE html>
<html lang="en">

<?php include('inc/head.php'); ?>

<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-4 window my-auto text-center">
            <?php 
                $exist = 0;
                while($row = $result->fetch_assoc()){
                    $exist = ($username == $row['username']) ? $exist+1 : $exist;
                }
                //se non esiste già l'username
                if($exist == 0){
                    switch ($sex){
                        case 'f':
                            $avatar = 'female.png';
                            break;
                        case 'm':
                            $avatar = 'male.png';
                            break;
                    }
                    //Se l'operazione è andata a buon fine...
                    $sql="
                        INSERT INTO users (username, password, mail, avatar)
                        VALUES ('$username', '$password', '$mail', '$avatar') 
                    ";
                    if($db->query($sql) == TRUE){ 
            ?>
                <div class="title-bar">
                    <div class="title-bar-text">PokeTurismo Registration Ok!</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body">
                    Username <?php echo $username ?> registered correctly!
                    <button onclick="location.href='index.php';">Go to the game!</button>
                </div>
            <?php 
                    }else{
                        //Se l'operazione è fallta...
                        echo 'Create new user error!';
                        echo '<button onclick="location.href=\'index.php\';">Back</button>';
                        exit;        
                    }
                }else{
                    echo 'Username already exist...';
                    echo '<button onclick="location.href=\'index.php\';">Back</button>';
                    exit; 
                }
            ?>
            </div>
        </div>
    </main>
      
    <?php include('inc/script.php'); ?>
    
</body>
</html>
<?php
    $db->close();
?>