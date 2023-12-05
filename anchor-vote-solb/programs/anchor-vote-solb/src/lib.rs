use anchor_lang::{prelude::*, solana_program::hash::hash};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod anchor_vote_solb {

    use super::*;
    pub fn initialize(ctx: Context<Initialize>, _url: String) -> Result<()> {
        ctx.accounts.vote.score = 0;
        ctx.accounts.vote.bump = ctx.bumps.vote;
        Ok(())
    }

    pub fn upvote(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vote.score += 1;
        Ok(())
    }

    pub fn downvote(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vote.score -= 1;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_url: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        space = Vote::INIT_SPACE,
        seeds = [hash(_url.as_bytes()).to_bytes().as_ref()],
        bump,
    )]
    vote: Account<'info, Vote>,
    system_program: Program<'info, System>,
}

#[account]
pub struct Vote {
    score: i64,
    bump: u8,
}

impl Space for Vote {
    const INIT_SPACE: usize = 8 + 8 + 1;
}
