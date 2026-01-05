<?php
session_start(); 

if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - PUP Maintenance</title>
    <link rel="stylesheet" href="dashboard.css"> 
</head>
<body>
    <div class="dash-main-wrapper">
        <?php include('component/sidebar.php'); ?>

        <main class="main-content">
            <header style="margin-bottom: 2rem;">
                <h1>Welcome to the Maintenance Dashboard</h1>
            </header>
            
            <div class="dash-container">
            </div>
        </main>
    </div>
</body>
</html>