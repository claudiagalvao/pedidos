<?php
// Configurações sensíveis ficam protegidas no servidor
$token = "4966605d15cf0988f02e0674bcd1e596e272eca1";
$store_id = "840344";
$url = "https://api.tiendanube.com/v1/$store_id/products";

$ch = curl_init($url);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authentication: bearer $token",
    "Content-Type: application/json",
    "User-Agent: PortalB2B_CrazyFantasy (contato@seudominio.com)"
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => curl_error($ch)]);
} else {
    http_response_code($http_code);
    header('Content-Type: application/json');
    // Permite que seu site JS acesse este PHP
    header('Access-Control-Allow-Origin: *'); 
    echo $response;
}

curl_close($ch);
?>
