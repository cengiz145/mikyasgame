#include <emscripten.h>
#include <cmath>
#include <iostream>

struct Vector2D {
    float x;
    float y;
};

struct Ball {
    Vector2D position;
    Vector2D velocity;
    float mass;
    float radius;
};

// Global instance of the ball
Ball ball = {{0.0f, 0.0f}, {0.0f, 0.0f}, 0.43f, 0.11f}; // Standard football mass ~0.43 kg, radius ~0.11m

extern "C" {

    // Başlangıç noktasını belirle
    EMSCRIPTEN_KEEPALIVE
    void InitBall(float startX, float startY) {
        ball.position.x = startX;
        ball.position.y = startY;
        ball.velocity.x = 0.0f;
        ball.velocity.y = 0.0f;
        std::cout << "C++ WASM Engine: Top sahaya yerlestirildi (" << startX << ", " << startY << ")" << std::endl;
    }

    // Topa kuvvet uygula (Şut/Pas)
    EMSCRIPTEN_KEEPALIVE
    void KickBall(float forceX, float forceY) {
        // F = m * a  ==>  a = F / m
        ball.velocity.x += forceX / ball.mass;
        ball.velocity.y += forceY / ball.mass;
    }

    // 60 FPS saniyelik güncellemeler (Sürtünme, İvme, Sekme)
    EMSCRIPTEN_KEEPALIVE
    void UpdatePhysics(float deltaTime, float frictionCoefficient, float boundWidth, float boundHeight) {
        // Sürtünme hesaplama
        float speed = std::sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
        
        if (speed > 0.01f) {
            float drop = speed * frictionCoefficient * deltaTime;
            float newSpeed = speed - drop;
            if (newSpeed < 0) newSpeed = 0.0f;
            
            ball.velocity.x = (ball.velocity.x / speed) * newSpeed;
            ball.velocity.y = (ball.velocity.y / speed) * newSpeed;
        } else {
            ball.velocity.x = 0.0f;
            ball.velocity.y = 0.0f;
        }

        // Hıza göre yeni pozisyonu güncelle
        ball.position.x += ball.velocity.x * deltaTime;
        ball.position.y += ball.velocity.y * deltaTime;

        // Sahadan dışarı çıkmayı engelleme ve sekme fiziği (Restitution: %80)
        if (ball.position.x < 0) {
            ball.position.x = 0;
            ball.velocity.x = -ball.velocity.x * 0.8f; 
        } else if (ball.position.x > boundWidth) {
            ball.position.x = boundWidth;
            ball.velocity.x = -ball.velocity.x * 0.8f;
        }

        if (ball.position.y < 0) {
            ball.position.y = 0;
            ball.velocity.y = -ball.velocity.y * 0.8f;
        } else if (ball.position.y > boundHeight) {
            ball.position.y = boundHeight;
            ball.velocity.y = -ball.velocity.y * 0.8f;
        }
    }

    // JS köprüsü için veri aktarımı
    EMSCRIPTEN_KEEPALIVE
    float GetBallX() { return ball.position.x; }

    EMSCRIPTEN_KEEPALIVE
    float GetBallY() { return ball.position.y; }
}
