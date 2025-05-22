package utils

import (
	"fmt"
	"github.com/shirou/gopsutil/v3/process"
	"net/http"
	"os"
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	p, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	mem, _ := p.MemoryInfo()
	memUsage := fmt.Sprintf("%.2f MB", float64(mem.RSS)/(1024*1024))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message": "%s"}`, memUsage)))
}
