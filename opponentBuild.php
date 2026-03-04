<?php
    include('inc/session.php');
    include('inc/connect.php');
    $page='Opponent Builder';
    // prendo i dati
    $name = $_POST['name'];
    $avatar = $_POST['avatar'];
    $level = $_POST['level'];
    $exp = $_POST['exp'];
    $money = $_POST['money'];
    $brave = $_POST['brave'];
    $clean = $_POST['clean'];
    $reflex = $_POST['reflex'];
    $acro = $_POST['acro'];
    $turn = $_POST['turn'];
    $brake = $_POST['brake'];
    $throttle = $_POST['throttle'];
    $shift = $_POST['shift'];
    $car = $_POST['model'];

    if($name){
        // creo l'avversario
        $sql="
            INSERT INTO users (username, avatar, level, exp, money, brave, clean, reflex, acro, turn, brake, throttle, shift, class)
            VALUES ('$name','$avatar', '$level', '$exp', '$money', '$brave', '$clean', '$reflex', '$acro', '$turn', '$brake', '$throttle', '$shift', 'opponent') 
        ";
        $result = $db->query($sql);
        // mi prendo il suo nuovo id
        $sql="
            SELECT id
            FROM users
            WHERE username = '$username'
        ";
        $result = $db->query($sql);
        $row = $result->fetch_assoc();
        $newOpponentId = $row['id'];
        // creo l'auto nel garage

        //associo l'auto all'avversario
    }

?>
<!DOCTYPE html>
<html lang="en">
<?php include('inc/head.php'); ?>
<body>
    
    <main class="container">
        <div class="row justify-content-center vh-100">
            <div class="col-lg-6 window my-auto">
                <div class="title-bar">
                    <div class="title-bar-text">Opponent Builder</div>
                    <div class="title-bar-controls">
                    <button aria-label="Close"></button>
                    </div>
                </div>
                <div class="window-body text-center">
                    
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