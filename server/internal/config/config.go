package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

type Config struct {
	Port           string
	DatabaseURL    string
	AdminToken     string
	UploadDir      string
	AllowedOrigins []string
	ReadTimeout    time.Duration
	WriteTimeout   time.Duration
}

func Load() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	adminToken := os.Getenv("ADMIN_TOKEN")
	if adminToken == "" {
		return nil, fmt.Errorf("ADMIN_TOKEN is required")
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "uploads"
	}

	allowedOrigins := []string{}
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		for _, origin := range strings.Split(origins, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		AdminToken:     adminToken,
		UploadDir:      uploadDir,
		AllowedOrigins: allowedOrigins,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
	}, nil
}
