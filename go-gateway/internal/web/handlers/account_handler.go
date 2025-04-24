package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/dto"
	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/service"
)

// AccountHandler processa requisições HTTP relacionadas a contas
type AccountHandler struct {
	accountService *service.AccountService
}

// NewAccountHandler cria um novo handler de contas
func NewAccountHandler(accountService *service.AccountService) *AccountHandler {
	return &AccountHandler{accountService: accountService}
}

// Retorna 201 Created ou erro 400/500
func (h *AccountHandler) Create(w http.ResponseWriter, r *http.Request) {
	log.Default().Println("POST /accounts")

	var input dto.CreateAccountInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Default().Printf("/accounts %+v \n", input)

	output, err := h.accountService.CreateAccount(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(output)
}

// Requer X-API-Key no header
func (h *AccountHandler) Get(w http.ResponseWriter, r *http.Request) {
	log.Default().Println("GET /accounts")

	apiKey := r.Header.Get("X-API-Key")
	if apiKey == "" {
		apiKey = r.URL.Query().Get("X-API-Key")
	}
	if apiKey == "" {
		http.Error(w, "API Key is required", http.StatusUnauthorized)
		return
	}

	log.Default().Printf("GET /accounts?X-API-Key=%s \n", apiKey)

	output, err := h.accountService.FindByAPIKey(apiKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(output)
}

// Requer X-API-Key no header
func (h *AccountHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	log.Default().Println("GET /accounts/all")

	apiKey := r.Header.Get("X-API-Key")
	if apiKey == "" {
		apiKey = r.URL.Query().Get("X-API-Key")
	}
	if apiKey == "" {
		http.Error(w, "API Key is required", http.StatusUnauthorized)
		return
	}

	log.Default().Printf("GET /accounts/all?X-API-Key=%s \n", apiKey)

	output, err := h.accountService.FindAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(output)
}
