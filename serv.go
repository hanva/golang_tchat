package main

import (
    "fmt"
    "log"
    "net/http"
	"golang.org/x/net/websocket"
)

func main() {

    hub := []*websocket.Conn{}
    http.Handle("/ok/", websocket.Handler(func(sock *websocket.Conn) {
        datas := map[string]interface{}{}
        hub = append(hub, sock)
        for {
            err := websocket.JSON.Receive(sock, &datas)
            if err != nil {
                fmt.Println("aled deconnection")    
                break
            }
            fmt.Printf("Server receive : %v\n", datas)
            for i := range hub {
                err2 := websocket.JSON.Send(hub[i], datas)
                if err2 != nil {
                }
            }
            for k := range datas {
                delete(datas, k)
            }
        }
        sock.Close()
    }))
    if err := http.ListenAndServe(":9999", nil); err != nil {
        log.Fatal("ListenAndServe:", err)
    }
} 