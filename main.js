var game

addEventListener("DOMContentLoaded", () => {
    game = new Game(document.getElementById("main").getContext("2d"), {
        enemyLap: 2.5,
        projectileSpeed: 3.5,
        enemySpeed: 2
    })
    game.run()
})

// values
𝛑 = Math.PI

class Shooter {
    constructor(ctx, ppt) {
        this.ctx = ctx
        this.ppt = ppt
        this.x = this.ctx.canvas.width / 2
        this.y = this.ctx.canvas.height / 2
    }

    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        this.ctx.closePath()
    }
}

class Projectile {
    constructor(ctx, ppt, coordinates, origin) {
        this.ctx = ctx
        this.ppt = ppt
        this.origin = origin
        this.coordinates = coordinates
        this.x = origin.x
        this.y = origin.y

        let perp = (this.coordinates.y - this.origin.y)
        let base = (this.coordinates.x - this.origin.x)
        let hyp = Math.sqrt(perp ** 2 + base ** 2)

        this.vx = (base / hyp) * this.ppt.speed
        this.vy = (perp / hyp) * this.ppt.speed
    }
    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        this.ctx.closePath()
        this.x += this.vx
        this.y += this.vy
    }
}

class Enemy {
    constructor(ctx, ppt, coordinates, origin) {
        this.ctx = ctx
        this.ppt = ppt
        this.origin = origin
        this.coordinates = coordinates
        this.x = coordinates.x
        this.y = coordinates.y

        let perp = (this.origin.x - this.coordinates.x)
        let base = (this.origin.y - this.coordinates.y)
        let hyp = Math.sqrt(perp ** 2 + base ** 2)

        this.vx = (perp / hyp) * this.ppt.speed
        this.vy = (base / hyp) * this.ppt.speed
    }
    spawn() {
        this.ctx.beginPath()
        this.ctx.fillStyle = this.ppt.color
        this.ctx.arc(this.x, this.y, this.ppt.radius, 0, 2 * 𝛑)
        this.ctx.fill()
        this.ctx.closePath()
        this.x += this.vx
        this.y += this.vy
    }
}

class Game {
    constructor(context, values) {
        this.context = context
        this.values = values
        this.projectiles = []
        this.enemies = []
        this.isGameRunning = false
        this.i = 0
        this.aura = 0
    }
    run() {
        this.context.canvas.addEventListener("mousedown", ({ offsetX, offsetY }) => {
            let projectile = this.regProjectile(offsetX, offsetY)
            this.projectiles.push(projectile)
        })
        window.addEventListener("keydown", ({ key }) => {
            if (key === " ") {
                this.isGameRunning ? ((this.isGameRunning = false) || cancelAnimationFrame(this.animationId)) : ((this.isGameRunning = true) && (this.animationId = requestAnimationFrame(this.animate.bind(this))))
            }
            if (key === "8") {
                this.boom()
            }
        })
        this.context.canvas.width = window.innerWidth
        this.context.canvas.height = window.innerHeight
        this.shooter = new Shooter(this.context, {
            color: "#fff",
            radius: 22
        })
        this.boomData = [
            {
                x: this.shooter.x,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y
            },
            {
                x: this.shooter.x,
                y: this.shooter.y + this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y + this.shooter.ppt.radius
            },
            {
                x: this.shooter.x + this.shooter.ppt.radius,
                y: this.shooter.y - this.shooter.ppt.radius
            },
            {
                x: this.shooter.x - this.shooter.ppt.radius,
                y: this.shooter.y + this.shooter.ppt.radius
            }
        ]


        this.animationId = requestAnimationFrame(this.animate.bind(this))
        this.isGameRunning = true
    }
    animate() {
        this.context.fillStyle = `rgba(0,0,0,.2)`
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)

        this.enemies.forEach((enemy, ie) => {
            enemy.spawn()
            let dist = Math.sqrt((this.shooter.x - enemy.x) ** 2 + (this.shooter.y - enemy.y) ** 2)
            if (dist <= (enemy.ppt.radius + this.shooter.ppt.radius)) {
                this.enemies.splice(ie, 1)
            }
            this.projectiles.forEach((projectile, ip) => {
                if (projectile.x <= 0 || projectile.y <= 0 || projectile.x >= this.context.canvas.width || projectile.y >= this.context.canvas.height) {
                    this.projectiles.splice(ip, 1)
                }
                let dist = Math.sqrt((projectile.x - enemy.x) ** 2 + (projectile.y - enemy.y) ** 2)
                if (dist <= (enemy.ppt.radius + projectile.ppt.radius + projectile.ppt.aura)) {
                    this.projectiles.splice(ip, 1)
                    this.enemies.splice(ie, 1)
                }
            })
        })
        this.projectiles.forEach((projectile) => { projectile.spawn() })
        this.shooter.spawn()

        if (this.i !== 60 * this.values.enemyLap) {
            this.i++
        } else {
            let enemy = this.regEnemy(this.eOrigin())
            this.enemies.push(enemy)
            this.i = 0
        }
        this.animationId = requestAnimationFrame(this.animate.bind(this))
    }
    boom() {
        this.boomData.forEach((coordinate)=>{
            let projectile = new Projectile(this.context, {
                color: "1eff00",
                radius: 50,
                speed: this.values.projectileSpeed * 7.5,
                aura:10
            }, coordinate, {
                x: this.shooter.x,
                y: this.shooter.y
            })            
            this.projectiles.push(projectile)
        })
    }

    regProjectile(x, y) {
        return new Projectile(this.context, {
            color: "#fff",
            radius: 10,
            speed: this.values.projectileSpeed,
            aura:0
        }, { x, y }, {
            x: this.shooter.x,
            y: this.shooter.y
        })
    }
    regEnemy(coordinates) {
        return new Enemy(this.context, {
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            radius: Math.random() * 33 + 7,
            speed: this.values.enemySpeed
        }, coordinates, {
            x: this.shooter.x,
            y: this.shooter.y
        })
    }
    eOrigin() {
        let wall = Math.round(Math.random() * 3) + 1
        let randNo = Math.random()
        let height = this.context.canvas.height, width = this.context.canvas.width
        let x = 0, y = 0
        switch (wall) {
            case 1:
                x = 0
                y = randNo * height
                break;
            case 2:
                x = width
                y = randNo * height
                break;
            case 3:
                x = randNo * width
                y = 0
                break;
            case 1:
                x = randNo * width
                x = height
                break;

            default:
                x = y = 0
                break;
        }
        return { x, y }
    }

}