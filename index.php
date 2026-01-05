<?php
session_start();
if (isset($_SESSION['role']) && $_SESSION['role'] === 'faculty') {
    header("Location: dashboard.php");
} else {
    header("Location: login/login.html");
}
exit();