import * as React from "react";

interface ResetPasswordEmailProps {
	username?: string;
	resetLink?: string;
}

export const ResetPasswordEmail = ({
	username,
	resetLink,
}: ResetPasswordEmailProps) => {
	return (
		<div style={{
            fontFamily: 'sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #eaeaea',
            borderRadius: '5px'
        }}>
			<h2>Reset your password</h2>
			<p>Hello {username},</p>
			<p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
			<div style={{ textAlign: 'center', margin: '30px 0' }}>
				<a href={resetLink} style={{
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                }}>
					Reset Password
				</a>
			</div>
			<p>Or copy and paste this URL into your browser:</p>
			<p style={{ wordBreak: 'break-all', color: '#0066cc' }}>{resetLink}</p>
			<hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '30px 0' }} />
			<p style={{ color: '#666', fontSize: '12px' }}>
				If you didn't request a password reset, please ignore this email or contact support if you have concerns.
			</p>
		</div>
	);
};

export default ResetPasswordEmail;
