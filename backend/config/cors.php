<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('FRONTEND_URLS', 'http://localhost:5173')),
    'allowed_origins_patterns' => [
        '#^http://192\.168\.\d{1,3}\.\d{1,3}:5173$#',
        '#^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$#',
        '#^http://172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:5173$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
