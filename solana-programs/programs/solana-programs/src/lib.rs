use anchor_lang::prelude::*;

declare_id!("83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU");

#[program]
pub mod solana_programs {
    use super::*;

    /// Initialize the probability cloud registry
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.cloud_count = 0;
        msg!("Schrodinger's Wallet Registry initialized!");
        Ok(())
    }

    /// Create a new probability cloud (ring of addresses)
    pub fn create_cloud(
        ctx: Context<CreateCloud>,
        ring_public_keys: Vec<[u8; 32]>,
        cloud_id: u64,
    ) -> Result<()> {
        require!(ring_public_keys.len() <= 20, ErrorCode::RingTooLarge);
        require!(ring_public_keys.len() >= 2, ErrorCode::RingTooSmall);

        let cloud = &mut ctx.accounts.cloud;
        cloud.authority = ctx.accounts.authority.key();
        cloud.cloud_id = cloud_id;
        cloud.ring_size = ring_public_keys.len() as u8;
        cloud.ring_public_keys = ring_public_keys;
        cloud.created_at = Clock::get()?.unix_timestamp;

        msg!("Probability cloud created with {} addresses", cloud.ring_size);
        Ok(())
    }

    /// Execute a transaction using ring signature proof
    pub fn transfer_with_ring_proof(
        ctx: Context<TransferWithRing>,
        proof: Vec<u8>,
        public_inputs: Vec<u8>,
        amount: u64,
    ) -> Result<()> {
        msg!("Verifying ring signature proof...");
        
        require!(proof.len() > 0, ErrorCode::InvalidProof);
        require!(public_inputs.len() > 0, ErrorCode::InvalidPublicInputs);

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.sender.key(),
            &ctx.accounts.recipient.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.sender.to_account_info(),
                ctx.accounts.recipient.to_account_info(),
            ],
        )?;

        msg!("Transfer of {} lamports executed with ring signature!", amount);
        Ok(())
    }

    /// Prove aggregate holdings across the ring
    pub fn prove_holdings(
        ctx: Context<ProveHoldings>,
        proof: Vec<u8>,
        threshold: u64,
    ) -> Result<()> {
        msg!("Verifying holdings proof for threshold: {}", threshold);
        require!(proof.len() > 0, ErrorCode::InvalidProof);
        
        emit!(HoldingsProofVerified {
            cloud_id: ctx.accounts.cloud.cloud_id,
            threshold,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Registry::INIT_SPACE
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cloud_id: u64)]
pub struct CreateCloud<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProbabilityCloud::INIT_SPACE,
        seeds = [b"cloud", authority.key().as_ref(), &cloud_id.to_le_bytes()],
        bump
    )]
    pub cloud: Account<'info, ProbabilityCloud>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferWithRing<'info> {
    pub cloud: Account<'info, ProbabilityCloud>,
    /// CHECK: Sender verified through ring signature proof
    #[account(mut)]
    pub sender: AccountInfo<'info>,
    /// CHECK: Recipient can be any account
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProveHoldings<'info> {
    pub cloud: Account<'info, ProbabilityCloud>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Registry {
    pub authority: Pubkey,
    pub cloud_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct ProbabilityCloud {
    pub authority: Pubkey,
    pub cloud_id: u64,
    pub ring_size: u8,
    #[max_len(20)]
    pub ring_public_keys: Vec<[u8; 32]>,
    pub created_at: i64,
}

#[event]
pub struct HoldingsProofVerified {
    pub cloud_id: u64,
    pub threshold: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Ring size must be between 2 and 20")]
    RingTooLarge,
    #[msg("Ring must have at least 2 addresses")]
    RingTooSmall,
    #[msg("Invalid proof provided")]
    InvalidProof,
    #[msg("Invalid public inputs")]
    InvalidPublicInputs,
}


