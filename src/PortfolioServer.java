import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

public class PortfolioServer {

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Serve static files from "www"
        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";

            File file = new File("www" + path);
            if (!file.exists()) {
                exchange.sendResponseHeaders(404, -1);
                return;
            }

            byte[] bytes = new FileInputStream(file).readAllBytes();
            String contentType = path.endsWith(".html") ? "text/html"
                    : path.endsWith(".css") ? "text/css"
                    : path.endsWith(".js") ? "application/javascript"
                    : "application/octet-stream";

            exchange.getResponseHeaders().add("Content-Type", contentType);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        });
        // Handle /upload POST requests
        server.createContext("/upload", exchange -> {
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });

        server.start();
        server.start();
        System.out.println("Server running at http://localhost:8080/");
    }
}