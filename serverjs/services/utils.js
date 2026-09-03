function generateRandomPassword(n) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let password = ""

  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    password += characters[randomIndex]
  }

  return password
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

module.exports = { generateRandomPassword, generateOTP }
