<?php
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized access.']);
    } else {
        header("Location: ../../index.php");
    }
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PUP Maintenance System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>PUP Maintenance System</h1>
        <p class="subtitle">Welcome, Faculty | <a href="login/php/logout.php" style="color: white;">Logout</a></p>
    </header>

    <main class="container">
        <div class="card">
            <a href="http://localhost/dashboard/MaintenanceModule/enrollment_maintenance/index.html">Enrollment Maintenance</a>
        </div>
    </main>

    <footer>
        <p>© 2025 PUP Maintenance System | Developed for Maintenance Module Activity</p>
    </footer>
</body>
</html>
