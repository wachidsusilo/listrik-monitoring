import { ServiceAccount } from 'firebase-admin'

interface ServiceAccountExtended extends ServiceAccount {
    type: string
    privateKeyId: string
    clientId: string
    authUri: string
    tokenUri: string
    authProviderX509CertUrl: string
    clientX509CertUrl: string
}

export const serviceAccount: ServiceAccountExtended = {
    type: 'service_account',
    projectId: 'listrik-monitoring',
    privateKeyId: '0414ee38913eea9b1aa06a41d65e4639ddbb4399',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCgF9qBR5JGs/Xm\nCzpWf/NEyRcdLFI1Cz637dqXGAn80Im7P7dmPq5SoWzXHBIcv7ffKQyq+IDAsTUm\nOLa3ssM4rumIOIAue6+OU11KmI4TH5xAqcG0kgzFW4keQMgibk888NGS4hKcNKH7\nmlkpTrnqvKK638wuwZ9wxyZbydhYFUdTG5+R3BRl87sapmeiWvAxjcQRqaxpLkgA\n44zYlBfMhDW9+20Q+pyA6v+pwDbQphLrtjT9sNjrlpdpiINgUW+lkCa7zrpH2DH5\n6E4kJF79aj1xbHCdzbYUZ/SR67yBLTh5WenxSwOB0YhsfSYPfsMVQp48C0eadHRn\nFfnXCamBAgMBAAECggEAFmnIhF14D/B9fne3culGbmyl0QaFutnobbk953Xs3gl3\nIvFEdKrVXomtkn8iVQaNUE+vr5cLdY7JtWBuylCbbsnkNZdNcNSNq0QmFT2+9FPy\nXQY3MZfZ9F6Al6zzqAhgDRTdDm6asuZWgEJndbZJJqFCuh1/eVNPxmsHRoX/hTM6\nsl2WOeWBGIcpW2SYfjWzUUskkuOUwRVa+MRoM5CWU/Qw9nNaf223GOiPXqrTmtW4\nUsP1FHpTBsO3L2h9sEv8NnFo0eP4/l/s9jduOxYd1RMwDRDWtf1HKVONmFJ5WYc9\nGz6MEmK+/DKfPmeLbguZAZEVTsfnmaG8REbZRoG2XQKBgQDT/sxiJR1tv87pv64F\nFS3D1Cud3utTUD4oETF6jWqUSPOv/FOT87hpQ6DI7uK3jCh4uccpRmu1qPjpDKmD\nSRRw5wyGdzI9guxXITwhtpuS+/jk+PwQCwxePuuW4J5pR7GedZHdVWCgl0cdwYcT\nm30v0B0W4vfe75m9nrVSYMUpbQKBgQDBUwg41BrmPBy+XfpZI+gxpS5eTnkUVmFW\nzrZ82U956i82bC27stg7GqVvkLGy3b/iUeaRcODOGnr5Ngx4NEO52e48aI3CQRrG\ndCI+5eBTN1qsIcf1TFN6ZomyrQ1bXyIJAYnASY50qbIH7MdpezX6qsuCV+7TqQnT\n8jDxFUwn5QKBgFKMIauJxjbI/FnakHlcMNDTGhTEC6AKW9mgMEMHM9v/uBvrxeOT\ngFhExCPZmSBdjBjORjXVPPWkkR+2FX+QgkwgO6lUWpTHGR4oS9DY2SVXxifqp8Pb\neXptR7EdT7GxAAGyyBSGPTTrEv8ML3u8DPgEMn+J63i8lYHXfcVQ9xTVAoGAS5lI\nsdBf5IDFTLw7VfhwqFlL1J0jRAyza9rSCeiA58/oPoP3Lls1q4c0Ani2xJdqnfoh\nC+b0QiSgyiuUnLzzbw4F16GbLcd/zPNFIQuLuX7/+igLpaT/T/IhDroVaxG8oYD0\neTlKd9yUPf0dzeXcqfV4N7RjNGn56ePft6b4bPECgYA4hO+ps1fPonDyic/K0lLB\ndrmhlLQE0xJ36jTzU36hR/G/FzvEPN93knUFZZ8psdXynNrJybUWZjtCBKzjCoQo\nvvo6EKDNkhB2m3T0j8lxINtbowLWVlHcIHp+XoyiA/AiTsI/Xdgg58hUx7kP3Ji/\n6fx0K5hW2CBlXUG0gOoBkw==\n-----END PRIVATE KEY-----\n',
    clientEmail: 'firebase-adminsdk-jtsmd@listrik-monitoring.iam.gserviceaccount.com',
    clientId: '115704257868139727129',
    authUri: 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: 'https://oauth2.googleapis.com/token',
    authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
    clientX509CertUrl: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jtsmd%40listrik-monitoring.iam.gserviceaccount.com'
}

const devTokens: {
    [key: string]: string
} = {
    'NWRlMGIyOTEtNmNjMy00MDJlLTkwYTctNTBlZWUyNDNhMzRk': 'NTIyZGQ5YmYtN2NkMS00MWFkLWEyMmEtOThjZjM4Y2Q2ZTE4'
}

export const isValidToken = (id: string, token: string) => {
    return devTokens[id] === token
}
