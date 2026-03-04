<nav class="navbar fixed-bottom navbar-expand window">
    <div class="container-fluid start">   
        <div class="navbar-collapse" id="navbarCollapse">
            <ul class="navbar-nav">
                <li class="nav-item dropup">
                    <button id="dropdown" data-bs-toggle="dropdown" aria-expanded="false"><img src="css/icon/start.png" alt="W" style="height: 0.8rem;"> Start</button>
                    <ul class="dropdown-menu window" aria-labelledby="dropdown">
                        <li><a class="dropdown-item" href="map.php">City Map</a></li>
                        <li><a class="dropdown-item" href="main.php">Garage</a></li>
                        <li><a class="dropdown-item" href="setting.php">Settings</a></li>
                        <li><a class="dropdown-item" href="#" id="menuPhone">Phone</a></li>
                        <li><a class="dropdown-item" href="inc/logout.php">Logout</a></li>
                    </ul>
                    <button class="status-bar-field" onclick="location.href='main.php';"><b>Car:</b> <?php echo $_SESSION['carName']; ?></button>
                </li>
            </ul>
        </div>
    </div>
    <div class="status-bar-field status-time">
        <b>Level:</b> <?php echo $_SESSION['userLevel']; ?> <b>Experience:</b> <?php echo $_SESSION['userExp']; ?> <b>Money:</b> <?php echo number_format($_SESSION['userMoney'], 2,",","."); ?>€
    </div>
</nav>