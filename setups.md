# WSL - Windows Subsystem for Linux

## Part 1: Install WSL
WSL is the Microsoft recommended way to run Linux on your Windows PC, as described here:  
https://learn.microsoft.com/en-us/windows/wsl/install

And, We will be using the default Ubuntu distribution of Linux, which seems to work fine.
   
```bash
# Install wsl
wsl --install 
```
 Select to allow elevated permissions when/if it asks; then wait for Ubuntu to install.
```bash
# Run wsl
wsl
```
Set your linus username & password.
```bash
# Go to your Linux home directory
cd ~
```
> Your Windows files live at `/mnt/c/Users/YourName`. Your Linux home is at `~/`. Keep your project inside the Linux filesystem for best performance.


## Part 2: Install uv and repo
```bash
# Run ubuntu
wsl -d Ubuntu

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Exit and re-enter WSL so PATH changes are picked up
exit
wsl -d Ubuntu

# Navigate to your projects folder
cd ~
mkdir projects && cd projects

# Clone the repo
git clone https://github.com/ubaidxai/HireMeAI.git
cd HireMeAI
 
# Install dependencies
uv sync
```

## Part 3: Configure IDE running in your PC environment
1. Open IDE, the usual way, on your PC
2. Download the Extension: `WSL`
3. Now press `Ctrl+Shift+P` -> search for WSL: New Window.
4. In the new WSL IDE window, Select the project folder to Open it.
5. In the WSL IDE window, download the Extenions: `Python (ms-python)`, `Jupyter (microsoft)`, and all the necessary extensions by clicking the "Install in WSL-Ubuntu" button.

---
---
# Docker in WSL
 
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io
sudo service docker start
docker --version
 
sudo apt install -y docker-compose
docker-compose --version
```
 
Test Docker is working:
 
```bash
docker run hello-world
```

---
---
# Qdrant
Qdrant is the vector database used by HireMeAI to store and search embeddings.

From the project root: 
```bash
# Option 01
docker compose up -d qdrant

# OR

# Option 02
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```
Data is persisted to `./qdrant_storage` on your machine. The container can be stopped and restarted without losing embeddings.

---
### Verify it's running
 
```bash
curl http://localhost:6333
# expected: {"title":"qdrant","version":"..."}
```
Or open the dashboard in your browser:
 
```
http://localhost:6333/dashboard
```
---

## Common commands
 
```bash
# Stop Qdrant
docker stop qdrant
 
# Start again (data is persisted)
docker start qdrant
 
# Check logs
docker logs qdrant
 
# Wipe all data and start fresh
docker rm -f qdrant && rm -rf ./qdrant_storage
```
 
---

## Notes
 
- Port `6333` — REST API (used by the Python client)
- Port `6334` — gRPC (not used in Phase 1)
- `./qdrant_storage` — local folder where all vector data lives. Do not delete this unless you want to re-ingest everything.
- When running inside Docker Compose, set `QDRANT_HOST=qdrant` in your `.env` (containers talk to each other by service name, not `localhost`)


---
### And you should be ready to roll!
You'll need to create a new ".env" file in the agents folder, and copy across your .env from your other project. And you'll need to click "Select Kernel" and "Choose python environment..".