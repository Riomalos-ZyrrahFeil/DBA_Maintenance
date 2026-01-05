<?php
session_start();
require_once('../../db.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];
    $selected_role = $_POST['role']; 

    // 1. Check if the Email exists at all in the system
    $stmt = $conn->prepare("SELECT user_id, password, role, reference_id FROM tbl_user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // 2. Email found, now check if the Role matches what they clicked
        if ($user['role'] !== $selected_role) {
            echo "<script>
                    alert('This email is registered as a " . $user['role'] . ", not " . $selected_role . ".');
                    window.location.href = '../../index.php';
                  </script>";
            exit();
        }

        if ($password === $user['password']) {
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['ref_id'] = $user['reference_id'];

            if ($user['role'] === 'faculty') {
                header("Location: ../../dashboard.php"); 
            } else {
                header("Location: ../../enrollment_maintenance/index.html");
            }
            exit();
        } else {
            echo "<script>
                    alert('Incorrect password. Please try again.');
                    window.location.href = '../../index.php';
                  </script>";
            exit();
        }
    } else {
        echo "<script>
                alert('No account found with that email address.');
                window.location.href = '../../index.php';
              </script>";
        exit();
    }
}
?>