use anchor_lang::prelude::*;

declare_id!("GAZdBWunGSzD4ozv4UinixTQQKSKc9SaS3qqDJgKEJUB");

#[program]
pub mod solana_programs {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
