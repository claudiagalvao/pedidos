<?php
$token = "4966605d15cf0988f02e0674bcd1e596e272eca1";
$store_id = "840344";
$url = "https://api.tiendanube.com/v1/$store_id/products";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authentication: bearer $token",
    "Content-Type: application/json",
    "User-Agent: PortalB2B_CrazyFantasy (contato@seusite.com)"
]);

$response = curl_exec($ch);
header('Content-Type: application/json');
echo $response;
curl_close($ch);
?>
