package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/perekoshik/tg-market2/server/internal/config"
	"github.com/perekoshik/tg-market2/server/internal/db"
	"github.com/perekoshik/tg-market2/server/internal/products"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	if err := os.MkdirAll(cfg.UploadDir, 0o755); err != nil {
		log.Fatalf("failed to ensure upload dir: %v", err)
	}

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database error: %v", err)
	}
	defer func() {
		_ = database.Close()
	}()

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	corsConfig := cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type", "Accept"},
		AllowCredentials: true,
	}
	if len(cfg.AllowedOrigins) > 0 {
		router.Use(cors.New(corsConfig))
	}

	repo := products.NewRepository(database)
	handler := products.NewHandler(repo)

	api := router.Group("/api")
	handler.RegisterPublicRoutes(api)

	router.StaticFS("/api/files", gin.Dir(cfg.UploadDir, true))

	uploadHandler := NewUploadHandler(cfg.UploadDir)
	protected := api.Group("")
	protected.Use(authMiddleware(cfg.AdminToken))
	protected.POST("/upload", uploadHandler.Handle)
	handler.RegisterProtectedRoutes(protected)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	log.Printf("starting api on %s", srv.Addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}
