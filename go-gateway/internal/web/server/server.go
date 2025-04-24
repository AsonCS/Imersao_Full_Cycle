package server

import (
	"net/http"

	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/service"
	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/web/handlers"
	"github.com/AsonCS/Imersao_Full_Cycle/go-gateway/internal/web/middleware"
	"github.com/go-chi/chi/v5"
)

type Server struct {
	router         *chi.Mux
	server         *http.Server
	accountService *service.AccountService
	invoiceService *service.InvoiceService
	port           string
}

func NewServer(accountService *service.AccountService, invoiceService *service.InvoiceService, port string) *Server {
	return &Server{
		router:         chi.NewRouter(),
		accountService: accountService,
		invoiceService: invoiceService,
		port:           port,
	}
}

func (s *Server) ConfigureRoutes() {
	accountHandler := handlers.NewAccountHandler(s.accountService)
	authMiddleware := middleware.NewAuthMiddleware(s.accountService)
	invoiceHandler := handlers.NewInvoiceHandler(s.invoiceService)

	s.router.Post("/accounts", accountHandler.Create)
	s.router.Get("/accounts", accountHandler.Get)
	s.router.Get("/accounts/all", accountHandler.GetAll)

	s.router.Group(func(r chi.Router) {
		r.Use(authMiddleware.Authenticate)
		r.Post("/invoice", invoiceHandler.Create)
		r.Get("/invoice/{id}", invoiceHandler.GetByID)
		r.Get("/invoice", invoiceHandler.ListByAccount)
	})
}

func (s *Server) Start() error {
	s.server = &http.Server{
		Addr:    ":" + s.port,
		Handler: s.router,
	}
	return s.server.ListenAndServe()
}
