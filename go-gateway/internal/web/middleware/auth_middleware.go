package middleware

import (
	"context"
	"net/http"

	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/domain"
	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/service"
)

type Prop string

const (
	AccountProp Prop = "account_prop"
)

type AuthMiddleware struct {
	accountService *service.AccountService
}

func NewAuthMiddleware(accountService *service.AccountService) *AuthMiddleware {
	return &AuthMiddleware{
		accountService: accountService,
	}
}

func (m *AuthMiddleware) Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-KEY")
		if apiKey == "" {
			apiKey = r.URL.Query().Get("X-API-Key")
		}
		if apiKey == "" {
			http.Error(w, "X-API-KEY is required", http.StatusUnauthorized)
			return
		}

		account, err := m.accountService.FindByAPIKey(apiKey)
		if err != nil {
			if err == domain.ErrAccountNotFound {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		ctx := context.WithValue(r.Context(), AccountProp, account)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
