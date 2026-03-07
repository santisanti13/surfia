/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Te han invitado a {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>🌊 SURFIA</Heading>
        <Heading style={h1}>¡Te han invitado!</Heading>
        <Text style={text}>
          Has sido invitado a unirte a{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . Haz clic en el botón para aceptar la invitación y crear tu cuenta.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Aceptar invitación
        </Button>
        <Text style={footer}>
          Si no esperabas esta invitación, puedes ignorar este email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const brand = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1ea7b3',
  margin: '0 0 24px',
  letterSpacing: '2px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#181f25',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#676e79',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const link = { color: '#1ea7b3', textDecoration: 'underline' }
const button = {
  backgroundColor: '#1ea7b3',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '12px',
  padding: '14px 24px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
